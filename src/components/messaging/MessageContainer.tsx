
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Define message type
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  isCurrentUser: boolean;
}

const DUMMY_MESSAGES = [
  {
    id: "1",
    content: "Hey there! How are you?",
    sender: "Alex Johnson",
    timestamp: Date.now() - 86400000, // 1 day ago
    isCurrentUser: false,
  },
  {
    id: "2",
    content: "I'm good, thanks! How about you?",
    sender: "currentUser",
    timestamp: Date.now() - 82800000, // 23 hours ago
    isCurrentUser: true,
  },
  {
    id: "3",
    content: "Doing well! Do you have time to discuss the project?",
    sender: "Alex Johnson",
    timestamp: Date.now() - 3600000, // 1 hour ago
    isCurrentUser: false,
  }
];

const MessageContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Get current user from localStorage
    const userString = localStorage.getItem("currentUser");
    if (userString) {
      const user = JSON.parse(userString);
      setCurrentUser(user);
      
      // Load messages (in a real app, this would come from a database)
      setMessages(DUMMY_MESSAGES);
    }
  }, []);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: currentUser?.name || "You",
      timestamp: Date.now(),
      isCurrentUser: true,
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    // Simulate response (in a real app, this would be actual responses)
    setTimeout(() => {
      const responses = [
        "That's interesting! Tell me more.",
        "I understand what you mean.",
        "Great! Let's discuss it further.",
        "I'll get back to you on that.",
        "Could you elaborate a bit more?",
      ];
      
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "Alex Johnson",
        timestamp: Date.now(),
        isCurrentUser: false,
      };
      
      setMessages(prev => [...prev, responseMsg]);
    }, 1000);
  };
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-messaging-bg">
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-messaging-secondary/80 flex items-center justify-center text-white font-medium">
            A
          </div>
          <div>
            <h2 className="font-medium">Alex Johnson</h2>
            <p className="text-xs text-gray-500">Online • Last seen just now</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              content={message.content}
              timestamp={message.timestamp}
              isCurrentUser={message.isCurrentUser}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            className="bg-messaging-primary hover:bg-messaging-primary/90"
            onClick={handleSendMessage}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  content: string;
  timestamp: number;
  isCurrentUser: boolean;
}

const MessageBubble = ({ content, timestamp, isCurrentUser }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <Card className={`p-3 max-w-[80%] ${
        isCurrentUser 
          ? "bg-messaging-primary text-white" 
          : "bg-white"
      }`}>
        <p className="text-sm">{content}</p>
        <p className={`text-xs mt-1 ${isCurrentUser ? "text-white/70" : "text-gray-500"}`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </Card>
    </div>
  );
};

export default MessageContainer;
