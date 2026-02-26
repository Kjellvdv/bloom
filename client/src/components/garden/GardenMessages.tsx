import { useEffect } from 'react';
import { useGardenMessages, useMarkMessageRead } from '../../hooks/useGarden';
import { Card, CardContent } from '../ui/card';

export function GardenMessages() {
  const { data: messages, isLoading } = useGardenMessages();
  const markRead = useMarkMessageRead();

  const unreadMessages = (messages as any)?.data || [];

  useEffect(() => {
    // Auto-mark first message as read after 5 seconds
    if (unreadMessages.length > 0) {
      const timer = setTimeout(() => {
        markRead.mutate(unreadMessages[0].id);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [unreadMessages.length]);

  if (isLoading || unreadMessages.length === 0) {
    return null;
  }

  const firstMessage = unreadMessages[0];

  return (
    <Card className="bg-primary/5 border-primary/20 animate-in slide-in-from-top">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">
            {firstMessage.messageType === 'welcome' && '👋'}
            {firstMessage.messageType === 'milestone' && '🎉'}
            {firstMessage.messageType === 'encouragement' && '💪'}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">{firstMessage.messageTextEs}</p>
          </div>
          <button
            onClick={() => markRead.mutate(firstMessage.id)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
