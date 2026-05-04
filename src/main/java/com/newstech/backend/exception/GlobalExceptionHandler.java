package com.newstech.backend.exception;

import com.newstech.backend.common.ApiResponse;

import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Lỗi validation (@NotBlank, @NotNull, @Size, ...)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<String> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return new ApiResponse<>(false, null, message);
    }

    // Lỗi logic nghiệp vụ (RuntimeException)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(RuntimeException.class)
    public ApiResponse<String> handleRuntime(RuntimeException ex) {
        ex.printStackTrace();
        return new ApiResponse<>(false, null, ex.getMessage());
    }

    // Lỗi không xác định
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public ApiResponse<String> handleAll(Exception ex) {
        ex.printStackTrace();
        return new ApiResponse<>(false, null, "Lỗi hệ thống: " + ex.getMessage());
    }
}