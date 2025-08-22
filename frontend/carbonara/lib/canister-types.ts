export interface CanisterError {
  message: string
  code?: string
}

export interface CanisterCallResult<T> {
  success: boolean
  data?: T
  error?: CanisterError
}

export interface UserProfile {
  principal: string
  name?: string
  created_at: bigint
}

export interface Message {
  id: bigint
  content: string
  author: string
  timestamp: bigint
}

export interface CanisterStatus {
  message_count: bigint
  user_count: bigint
  global_message: string
}

// Helper function for handling canister calls with error handling
export const handleCanisterCall = async <T>(\
  call: () => Promise<T>\
)
: Promise<CanisterCallResult<T>> =>
{
  try {
    const data = await call()
    return { success: true, data };
  } catch (error: any) {
    console.error("Canister call failed:", error)
    return {
      success: false,
      error: {
        message: error.message || 'Unknown canister error',
        code: error.code
      }
    };
  }
}
