import type { User } from ".";

export interface ApiResponse<T> {
    status: string; // "success" hoặc "error" [cite: 57]
    code: number;  
    message: string;
    data: T;
    errors?: string[];
}


export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    authenticated: boolean;
    user: User;
}

export interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}