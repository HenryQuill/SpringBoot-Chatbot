package com.example.chatbotv2.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class ChatCacheService {
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public ChatCacheService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = new ObjectMapper();
    }

    private String getRedisKey(Long conversationId) {
        return "chat:session:" + conversationId;
    }

    public void addMessage(Long conversationId, String senderType, String messageText) {
        try {
            String json = objectMapper.writeValueAsString(
                    new ChatMessage(senderType, messageText)
            );
            redisTemplate.opsForList().rightPush(getRedisKey(conversationId), json);
            redisTemplate.expire(getRedisKey(conversationId), 1, TimeUnit.HOURS);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public List<String> getRecentMessages(Long conversationId, int limit) {
        long size = redisTemplate.opsForList().size(getRedisKey(conversationId));
        long start = Math.max(size - limit, 0);
        return redisTemplate.opsForList().range(getRedisKey(conversationId), start, size);
    }

    public void clearSession(Long conversationId) {
        redisTemplate.delete(getRedisKey(conversationId));
    }

    // Inner class for serialization
    private static class ChatMessage {
        public String senderType;
        public String messageText;

        public ChatMessage(String senderType, String messageText) {
            this.senderType = senderType;
            this.messageText = messageText;
        }
    }
}
