import { getCurrentSessionUser } from "./auth";
import {
  getActiveVoterId,
  getVotingStatus,
  listCandidates,
  listResidents,
  listUsers,
} from "./repository";
import type { BootstrapData } from "./types";
import { getVotingPublicKey } from "./vote-crypto";

export async function getBootstrapData(): Promise<BootstrapData> {
  const currentUser = await getCurrentSessionUser();
  return {
    residents: listResidents(),
    candidates: listCandidates(),
    users: listUsers(),
    activeVoterId: getActiveVoterId(),
    currentUser,
    votingStatus: getVotingStatus(),
    votingEncryptionPublicKey: getVotingPublicKey(),
  };
}
