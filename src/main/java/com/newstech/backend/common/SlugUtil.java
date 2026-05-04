package com.newstech.backend.common;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class SlugUtil {

    public static String toSlug(String input) {
        if (input == null)
            return "";

        String temp = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(temp).replaceAll("");

        return slug.toLowerCase()
                .replace("đ", "d")
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }
}