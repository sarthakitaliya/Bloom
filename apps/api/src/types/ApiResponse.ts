export type ApiResponse<T> = {
    success: boolean;
    message?: string;
    restoring?: boolean;
    data?: T;
}