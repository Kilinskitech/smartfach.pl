import type { Workspace } from "./workspace";

export function deleteConversation(workspace: Workspace, conversationId: string): Workspace {
  return { ...workspace, conversations: workspace.conversations.filter(c => c.id !== conversationId) };
}
