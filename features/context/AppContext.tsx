"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  BootstrapData,
  Candidate,
  Resident,
  SessionUser,
  User,
  VotingStatus,
} from "@/lib/types";
import { encryptVotePayload } from "@/lib/vote-encryption-client";

interface AppContextType extends BootstrapData {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isBootstrapping: boolean;
  login: (username: string, password: string) => Promise<SessionUser | null>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  addResident: (resident: Omit<Resident, "id" | "hasVoted" | "isPresent">) => Promise<void>;
  importResidents: (
    residents: Array<
      Pick<
        Resident,
        | "nik"
        | "name"
        | "birthPlace"
        | "gender"
        | "identityIssuedPlace"
        | "occupation"
      >
    >,
  ) => Promise<{ created: number; updated: number; total: number }>;
  updateResident: (id: string, updates: Partial<Resident>) => Promise<void>;
  deleteResident: (id: string) => Promise<void>;
  addCandidate: (candidate: Omit<Candidate, "id" | "voteCount">) => Promise<void>;
  updateCandidate: (id: string, updates: Partial<Candidate>) => Promise<void>;
  deleteCandidate: (id: string) => Promise<void>;
  setActiveVoter: (id: string | null) => Promise<void>;
  castVote: (candidateId: string) => Promise<void>;
  toggleAttendance: (residentId: string) => Promise<void>;
  setVotingStatus: (status: VotingStatus, reset?: boolean) => Promise<void>;
  addUser: (user: Omit<User, "id">) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  generateElectionAnalysis: (payload: {
    analytics: {
      totalResidents: number;
      totalVotes: number;
      turnoutPercentage: number;
      presentCount: number;
      absentCount: number;
    };
    candidates: Candidate[];
  }) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error || "Request gagal diproses.");
  }

  return response.json() as Promise<T>;
}

export function AppProvider({
  children,
  initialData,
}: PropsWithChildren<{ initialData: BootstrapData }>) {
  const [data, setData] = useState(initialData);
  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const isRefreshingRef = useRef(false);

  const refreshData = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;
    if (!silent) {
      setIsBootstrapping(true);
    }

    try {
      const nextData = await request<BootstrapData>("/api/bootstrap", {
        method: "GET",
        cache: "no-store",
      });
      setData(nextData);
    } finally {
      isRefreshingRef.current = false;
      if (!silent) {
        setIsBootstrapping(false);
      }
    }
  };

  const refresh = async () => {
    await refreshData();
  };

  useEffect(() => {
    if (!data.currentUser) {
      return;
    }

    const intervalMs = data.votingStatus === "active" ? 3000 : 10000;
    const intervalId = window.setInterval(() => {
      void refreshData({ silent: true });
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [data.currentUser, data.votingStatus]);

  const login = async (username: string, password: string) => {
    try {
      const response = await request<{ success: boolean; user: SessionUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      await refresh();
      return response.user;
    } catch {
      return null;
    }
  };

  const logout = async () => {
    await request("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    await refresh();
  };

  const addResident = async (
    resident: Omit<Resident, "id" | "hasVoted" | "isPresent">,
  ) => {
    await request("/api/residents", {
      method: "POST",
      body: JSON.stringify(resident),
    });
    await refresh();
  };

  const importResidents = async (
    residents: Array<
      Pick<
        Resident,
        | "nik"
        | "name"
        | "birthPlace"
        | "gender"
        | "identityIssuedPlace"
        | "occupation"
      >
    >,
  ) => {
    const response = await request<{ created: number; updated: number; total: number }>(
      "/api/residents/import",
      {
        method: "POST",
        body: JSON.stringify({ residents }),
      },
    );
    await refresh();
    return response;
  };

  const updateResidentAction = async (id: string, updates: Partial<Resident>) => {
    await request(`/api/residents/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    await refresh();
  };

  const deleteResidentAction = async (id: string) => {
    await request(`/api/residents/${id}`, { method: "DELETE" });
    await refresh();
  };

  const addCandidate = async (candidate: Omit<Candidate, "id" | "voteCount">) => {
    await request("/api/candidates", {
      method: "POST",
      body: JSON.stringify(candidate),
    });
    await refresh();
  };

  const updateCandidateAction = async (
    id: string,
    updates: Partial<Candidate>,
  ) => {
    await request(`/api/candidates/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    await refresh();
  };

  const deleteCandidateAction = async (id: string) => {
    await request(`/api/candidates/${id}`, { method: "DELETE" });
    await refresh();
  };

  const setActiveVoter = async (id: string | null) => {
    await request("/api/booth/active-voter", {
      method: "POST",
      body: JSON.stringify({ residentId: id }),
    });
    await refresh();
  };

  const castVote = async (candidateId: string) => {
    const encryptedVote = await encryptVotePayload(data.votingEncryptionPublicKey, {
      candidateId,
      issuedAt: Date.now(),
    });

    await request("/api/votes/cast", {
      method: "POST",
      body: JSON.stringify({ encryptedVote }),
    });
    await refresh();
  };

  const toggleAttendance = async (residentId: string) => {
    await request("/api/attendance/toggle", {
      method: "POST",
      body: JSON.stringify({ residentId }),
    });
    await refresh();
  };

  const setVotingStatusAction = async (status: VotingStatus, reset = false) => {
    await request("/api/voting/status", {
      method: "POST",
      body: JSON.stringify({ status, reset }),
    });
    await refresh();
  };

  const addUser = async (user: Omit<User, "id">) => {
    await request("/api/users", {
      method: "POST",
      body: JSON.stringify(user),
    });
    await refresh();
  };

  const updateUserAction = async (id: string, updates: Partial<User>) => {
    await request(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    await refresh();
  };

  const deleteUserAction = async (id: string) => {
    await request(`/api/users/${id}`, { method: "DELETE" });
    await refresh();
  };

  const generateElectionAnalysis = async (payload: {
    analytics: {
      totalResidents: number;
      totalVotes: number;
      turnoutPercentage: number;
      presentCount: number;
      absentCount: number;
    };
    candidates: Candidate[];
  }) => {
    const response = await request<{ analysis: string }>("/api/analysis", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return response.analysis;
  };

  const value = useMemo<AppContextType>(() => {
    return {
      ...data,
      isAdmin:
        data.currentUser?.role === "admin" ||
        data.currentUser?.role === "super_admin",
      isSuperAdmin: data.currentUser?.role === "super_admin",
      isBootstrapping,
      login,
      logout,
      refresh,
      addResident,
      importResidents,
      updateResident: updateResidentAction,
      deleteResident: deleteResidentAction,
      addCandidate,
      updateCandidate: updateCandidateAction,
      deleteCandidate: deleteCandidateAction,
      setActiveVoter,
      castVote,
      toggleAttendance,
      setVotingStatus: setVotingStatusAction,
      addUser,
      updateUser: updateUserAction,
      deleteUser: deleteUserAction,
      generateElectionAnalysis,
    };
  }, [data, isBootstrapping]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
