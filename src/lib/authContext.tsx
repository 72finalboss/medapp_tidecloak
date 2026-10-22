"use client";

import React, { createContext, useContext, useState } from 'react';
import { User, UserRole, StaffEvidence, ProfileUpdateDiff } from './types';
import { MOCK_USERS_CREDENTIALS, UserCredential } from './mockData';

export interface SignUpData {
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  title: string;
  password: string;
  evidence?: StaffEvidence;
}

interface AuthContextType {
  currentUser: User | null;
  activeRole: UserRole | null;
  authenticated: boolean;
  rememberedUsername: string;
  setRememberedUsername: (uname: string) => void;
  continueSignIn: (username?: string) => { success: boolean; message?: string };
  loginWithCredentials: (username: string, password: string) => { success: boolean; message?: string; isPendingVerification?: boolean };
  signUp: (data: SignUpData) => { success: boolean; message?: string; isPendingVerification?: boolean; user?: User };
  activateUser: (username: string) => void;
  updateCredentialsSelfService: (newUsername: string, newPassword?: string) => { success: boolean; message: string };
  applyApprovedProfileUpdate: (username: string, newValues: ProfileUpdateDiff) => void;
  quickLogin: (usernameOrRole: string) => void;
  logout: () => void;
  isMockMode: boolean;
  doken: string;
  availableUsers: Record<string, UserCredential>;
  // TideCloak SDK-compatible RBAC & Token Claims surface (Tide MCP canon/feature-mapping)
  hasRealmRole: (roleName: string) => boolean;
  hasClientRole: (roleName: string, clientId?: string) => boolean;
  checkAccess: (requiredRoles: string[], clientId?: string) => {
    allowed: boolean;
    reason: string;
    matchedRoles: string[];
  };
  getValueFromIdToken: (claim: string) => any;
  tokenClaims: Record<string, any> | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usersMap, setUsersMap] = useState<Record<string, UserCredential>>(MOCK_USERS_CREDENTIALS);
  const [rememberedUsername, setRememberedUsername] = useState<string>('truongnguyenxuanvinh');

  // Currently logged-in user
  const [currentUser, setCurrentUser] = useState<User | null>(
    MOCK_USERS_CREDENTIALS['truongnguyenxuanvinh']?.user || null
  );
  const [activeRole, setActiveRole] = useState<UserRole | null>(
    MOCK_USERS_CREDENTIALS['truongnguyenxuanvinh']?.user.role || 'doctor'
  );
  const [authenticated, setAuthenticated] = useState<boolean>(true);

  // 1-Click Continue as remembered user (matching TideCloak screenshot)
  const continueSignIn = (username?: string): { success: boolean; message?: string } => {
    const target = (username || rememberedUsername).trim().toLowerCase();
    const cred = usersMap[target] || usersMap['truongnguyenxuanvinh'] || Object.values(usersMap)[0];
    if (cred) {
      if (cred.user.isVerified === false) {
        return { success: false, message: 'Tài khoản chưa được Hội đồng Y khoa thẩm định minh chứng.' };
      }
      setCurrentUser(cred.user);
      setActiveRole(cred.user.role);
      setRememberedUsername(cred.username);
      setAuthenticated(true);
      return { success: true };
    }
    return { success: false, message: 'Không tìm thấy tài khoản.' };
  };

  // Sign in with explicit username & password
  const loginWithCredentials = (username: string, password: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cred = usersMap[cleanUser];
    if (!cred) {
      return { success: false, message: 'Tên đăng nhập không tồn tại trong hệ thống TideCloak.' };
    }
    if (cred.passwordHash !== password) {
      return { success: false, message: 'Mật khẩu PRISM không chính xác (mật khẩu mẫu là Password123!).' };
    }
    if (cred.user.isVerified === false) {
      return {
        success: false,
        isPendingVerification: true,
        message: 'Tài khoản nhân sự y tế đang trong trạng thái CHỜ THẨM ĐỊNH MINH CHỨNG bởi Ban Giám Đốc & Hội đồng Y khoa. Chưa thể đăng nhập.',
      };
    }

    setCurrentUser(cred.user);
    setActiveRole(cred.user.role);
    setRememberedUsername(cred.username);
    setAuthenticated(true);
    return { success: true };
  };

  // Sign up a new user
  const signUp = (data: SignUpData) => {
    const cleanUser = data.username.trim().toLowerCase();
    if (usersMap[cleanUser]) {
      return { success: false, message: 'Tên đăng nhập này đã được đăng ký trong hệ thống.' };
    }

    const isPatient = data.role === 'patient';
    const isVerified = isPatient; // Patients are verified immediately; medical staff require verification

    const newUser: User = {
      id: `usr_${Date.now()}`,
      username: cleanUser,
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role,
      avatar: `https://images.unsplash.com/photo-${
        data.role === 'doctor'
          ? '1622253692010-333f2da6031d'
          : data.role === 'pharmacist'
          ? '1594824813626-d62f8ea3b9b4'
          : data.role === 'director'
          ? '1537368910025-700350fe46c7'
          : '1544005313-94ddf0286df2'
      }?w=150&auto=format&fit=crop&q=80`,
      department: data.department || (isPatient ? 'Khu Khám Bệnh Ngoại Trú' : 'Bệnh viện AegisMed'),
      title: data.title || (isPatient ? 'Bệnh nhân' : 'Bác sĩ / Nhân sự Y tế'),
      licenseNumber: data.evidence?.licenseNumber,
      isVerified,
      evidence: data.evidence,
      pii: {
        phone: '0909 000 111',
        dateOfBirth: '1995-01-01',
        address: 'Quận 1, TP. Hồ Chí Minh',
        emergencyContact: 'Người thân (0909 999 888)',
      },
      spii: {
        nationalId: `079095${Math.floor(100000 + Math.random() * 900000)}`,
        healthInsuranceCode: `DN-4-79-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        taxOrSocialSecurityId: `MST-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        geneticAndSensitiveHistory: 'Hồ sơ sinh học mã hóa E2EE. Không ghi nhận bất thường di truyền đặc biệt.',
        biometricEnclaveKeyFingerprint: `SHA256:ae:88:1c:${Math.random().toString(16).slice(2, 10)}:vvk`,
      },
    };

    const newCred: UserCredential = {
      username: cleanUser,
      passwordHash: data.password,
      user: newUser,
    };

    setUsersMap((prev) => ({
      ...prev,
      [cleanUser]: newCred,
    }));

    if (isPatient) {
      setCurrentUser(newUser);
      setActiveRole(newUser.role);
      setRememberedUsername(cleanUser);
      setAuthenticated(true);
      return { success: true, isPendingVerification: false, user: newUser };
    } else {
      // Non-patient: Account created but PENDING MULTI-PARTY VERIFICATION
      return {
        success: true,
        isPendingVerification: true,
        user: newUser,
        message: 'Hồ sơ đã được gửi tới Hội đồng Thẩm định Chuyên môn (Cần 2/3 chữ ký Quorum để kích hoạt).',
      };
    }
  };

  // Called when Quorum approves a staff applicant
  const activateUser = (username: string) => {
    const clean = username.trim().toLowerCase();
    setUsersMap((prev) => {
      const existing = prev[clean];
      if (!existing) return prev;
      return {
        ...prev,
        [clean]: {
          ...existing,
          user: {
            ...existing.user,
            isVerified: true,
          },
        },
      };
    });
  };

  // Self-service update for username and password ONLY (does NOT require Quorum approval)
  const updateCredentialsSelfService = (newUsername: string, newPassword?: string) => {
    if (!currentUser) {
      return { success: false, message: 'Chưa đăng nhập.' };
    }
    const oldKey = currentUser.username.trim().toLowerCase();
    const cleanNew = newUsername.trim().toLowerCase();

    if (!cleanNew) {
      return { success: false, message: 'Username không được để trống.' };
    }

    if (cleanNew !== oldKey && usersMap[cleanNew]) {
      return { success: false, message: 'Username mới đã tồn tại trong hệ thống TideCloak.' };
    }

    const existingCred = usersMap[oldKey];
    if (!existingCred) {
      return { success: false, message: 'Không tìm thấy bản ghi tài khoản.' };
    }

    const updatedUser: User = {
      ...existingCred.user,
      username: cleanNew,
    };

    const updatedCred: UserCredential = {
      username: cleanNew,
      passwordHash: newPassword && newPassword.trim().length > 0 ? newPassword : existingCred.passwordHash,
      user: updatedUser,
    };

    setUsersMap((prev) => {
      const copy = { ...prev };
      if (cleanNew !== oldKey) {
        delete copy[oldKey];
      }
      copy[cleanNew] = updatedCred;
      return copy;
    });

    setCurrentUser(updatedUser);
    setRememberedUsername(cleanNew);

    return {
      success: true,
      message: `Đã cập nhật trực tiếp thông tin xác thực (${
        cleanNew !== oldKey ? `Username mới: ${cleanNew}` : 'Giữ nguyên Username'
      }${newPassword && newPassword.trim().length > 0 ? ', đã đổi Mật khẩu PRISM mới' : ''}) mà không cần chờ hội chẩn.`,
    };
  };

  // Called when Quorum approves a profile PII/info modification request
  const applyApprovedProfileUpdate = (username: string, newValues: ProfileUpdateDiff) => {
    const clean = username.trim().toLowerCase();
    setUsersMap((prev) => {
      const existing = prev[clean];
      if (!existing) return prev;

      const curPii = existing.user.pii || {
        phone: '',
        dateOfBirth: '',
        address: '',
        emergencyContact: '',
      };

      const updatedUser: User = {
        ...existing.user,
        name: newValues.name ?? existing.user.name,
        email: newValues.email ?? existing.user.email,
        department: newValues.department ?? existing.user.department,
        title: newValues.title ?? existing.user.title,
        licenseNumber: newValues.licenseNumber ?? existing.user.licenseNumber,
        pii: {
          phone: newValues.phone ?? curPii.phone,
          dateOfBirth: newValues.dateOfBirth ?? curPii.dateOfBirth,
          address: newValues.address ?? curPii.address,
          emergencyContact: newValues.emergencyContact ?? curPii.emergencyContact,
        },
      };

      setCurrentUser((curr) => (curr && curr.username.toLowerCase() === clean ? updatedUser : curr));

      return {
        ...prev,
        [clean]: {
          ...existing,
          user: updatedUser,
        },
      };
    });
  };

  const quickLogin = (usernameOrRole: string) => {
    const key = usernameOrRole.trim().toLowerCase();
    let cred = usersMap[key];
    if (!cred) {
      const found = Object.values(usersMap).find((c) => c.user.role === usernameOrRole);
      if (found) cred = found;
    }
    if (cred) {
      setCurrentUser(cred.user);
      setActiveRole(cred.user.role);
      setRememberedUsername(cred.username);
      setAuthenticated(true);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveRole(null);
    setAuthenticated(false);
  };

  const doken = currentUser
    ? `mock_vvk_dpop_${currentUser.role}_${currentUser.id.slice(0, 8)}`
    : '';

  const ROLE_SCOPES_MAP: Record<string, string[]> = {
    doctor: [
      'ehr:read',
      'ehr:write',
      'prescription:propose',
      'quorum:sign',
      'support:reply',
      'pii:propose',
      'spii:request-once',
    ],
    pharmacist: [
      'ehr:read',
      'prescription:verify',
      'quorum:sign',
      'support:reply',
      'pii:propose',
      'spii:request-once',
    ],
    director: [
      'ehr:read',
      'staff:verify-evidence',
      'quorum:sign',
      'policy:manage',
      'pii:propose',
      'spii:request-once',
    ],
    patient: [
      'appointment:book',
      'support:ask',
      'profile:read-own',
      'pii:propose',
      'spii:request-once',
    ],
    ai_auditor: ['ehr:read', 'prescription:safety-audit', 'quorum:sign'],
  };

  const tokenClaims: Record<string, any> | null =
    authenticated && currentUser && activeRole
      ? {
          iss: 'http://localhost:8080/realms/nexus-lms',
          sub: currentUser.id,
          azp: 'nexus-lms-client',
          preferred_username: currentUser.username,
          name: currentUser.name,
          email: currentUser.email,
          vuid: `vuid_tide_${currentUser.id}`,
          tideUserKey: `ed25519_pub_${activeRole}_${currentUser.id.slice(0, 8)}`,
          realm_access: {
            roles: [activeRole, '_tide_enabled', 'default-roles-nexus-lms', 'offline_access'],
          },
          resource_access: {
            'nexus-lms-client': {
              roles: [activeRole, ...(ROLE_SCOPES_MAP[activeRole] || [])],
            },
            ...(['doctor', 'pharmacist', 'director', 'ai_auditor'].includes(activeRole)
              ? {
                  'realm-management': {
                    roles: ['tide-realm-admin'],
                  },
                }
              : {}),
          },
          cnf: {
            jkt: `dpop_p256_jkt_${activeRole}_${currentUser.id.slice(0, 6)}`,
          },
        }
      : null;

  const hasRealmRole = (roleName: string): boolean => {
    if (!tokenClaims) return false;
    const roles: string[] = tokenClaims.realm_access?.roles || [];
    return roles.includes(roleName);
  };

  const hasClientRole = (roleName: string, clientId: string = 'nexus-lms-client'): boolean => {
    if (!tokenClaims) return false;
    const roles: string[] = tokenClaims.resource_access?.[clientId]?.roles || [];
    return roles.includes(roleName);
  };

  const checkAccess = (requiredRoles: string[], clientId?: string) => {
    if (!authenticated || !currentUser || !tokenClaims) {
      return {
        allowed: false,
        reason: 'Chưa xác thực phiên TideCloak (401 Unauthorized).',
        matchedRoles: [],
      };
    }
    const matchedRoles = requiredRoles.filter((r) =>
      clientId ? hasClientRole(r, clientId) : hasRealmRole(r) || hasClientRole(r)
    );
    if (matchedRoles.length === 0) {
      return {
        allowed: false,
        reason: `Từ chối truy cập (403 Forbidden): Vai trò hiện tại [${activeRole}] thiếu quyền yêu cầu (${requiredRoles.join(' | ')}).`,
        matchedRoles: [],
      };
    }
    return {
      allowed: true,
      reason: `Được cấp quyền truy cập qua TideCloak RBAC (${matchedRoles.join(', ')}).`,
      matchedRoles,
    };
  };

  const getValueFromIdToken = (claim: string): any => {
    if (!tokenClaims) return undefined;
    return tokenClaims[claim];
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        authenticated,
        rememberedUsername,
        setRememberedUsername,
        continueSignIn,
        loginWithCredentials,
        signUp,
        activateUser,
        updateCredentialsSelfService,
        applyApprovedProfileUpdate,
        quickLogin,
        logout,
        isMockMode: true,
        doken,
        availableUsers: usersMap,
        hasRealmRole,
        hasClientRole,
        checkAccess,
        getValueFromIdToken,
        tokenClaims,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Official TideCloak SDK-compatible hook alias (matches @tidecloak/nextjs surface)
export function useTideCloak() {
  return useAuth();
}
