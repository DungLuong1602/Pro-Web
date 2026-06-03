package com.localspotify.dto;

public class ApiResponse<T> {
    private int status;
    private String message;
    private T data;

    // Hàm khởi tạo
    public ApiResponse(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    public ApiResponse() {}

    // Getter và Setter
    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}