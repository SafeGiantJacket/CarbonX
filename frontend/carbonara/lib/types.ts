export interface Message {
  id: bigint
  content: string
  author: string
  timestamp: bigint
}

export interface UserProfile {
  principal: string
  name?: string
  created_at: bigint
}

export interface CanisterStatus {
  message_count: bigint
  user_count: bigint
  global_message: string
}

export interface CanisterError {
  message: string
  code?: string
}

export interface CanisterCallResult<T> {
  success: boolean
  data?: T
  error?: CanisterError
}
