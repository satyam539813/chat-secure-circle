
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { ImagePlus, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Define message type
interface Message {
  id: string;
  content: string;
  image_url?: string;
  sender: string;
  timestamp: number;
  isCurrentUser: boolean;
}

const GeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if user is authenticated and fetch messages
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        fetchMessages(user.id);
      }
    };
    
    checkUser();
  }, []);
  
  const fetchMessages = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        const formattedMessages = data.map((message) => ({
          id: message.id,
          content: message.content || "",
          image_url: message.image_url,
          sender: message.is_user ? "You" : "Gemini AI",
          timestamp: new Date(message.created_at).getTime(),
          isCurrentUser: message.is_user,
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() && !imageFile) return;
    if (!currentUser) {
      toast.error("You need to be logged in to send messages");
      return;
    }
    
    setLoading(true);
    let imageUrl = null;
    
    try {
      // Upload image if selected
      if (imageFile) {
        const filePath = `${currentUser.id}/${uuidv4()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("chat_images")
          .upload(filePath, imageFile);
          
        if (uploadError) throw uploadError;
        
        if (uploadData) {
          imageUrl = `chat_images/${filePath}`;
        }
      }
      
      // Save user message to database
      const userMessageId = uuidv4();
      const userMessage = {
        id: userMessageId,
        content: newMessage,
        image_url: imageUrl,
        sender: "You",
        timestamp: Date.now(),
        isCurrentUser: true,
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage("");
      setImageFile(null);
      setImagePreview(null);
      
      // Save to Supabase
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          id: userMessageId,
          content: newMessage,
          image_url: imageUrl,
          user_id: currentUser.id,
          is_user: true,
        });
        
      if (insertError) throw insertError;
      
      // Call Gemini API
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      
      const response = await fetch(`${supabase.functions.url}/gemini-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage,
          imageUrl: imageUrl,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response from AI");
      }
      
      const data = await response.json();
      
      // Save AI response
      const aiMessageId = uuidv4();
      const aiMessage = {
        id: aiMessageId,
        content: data.response,
        sender: "Gemini AI",
        timestamp: Date.now(),
        isCurrentUser: false,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Save to Supabase
      await supabase
        .from('chat_messages')
        .insert({
          id: aiMessageId,
          content: data.response,
          user_id: currentUser.id,
          is_user: false,
        });
        
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type and size
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleClickAttach = () => {
    fileInputRef.current?.click();
  };
  
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-messaging-bg">
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            G
          </div>
          <div>
            <h2 className="font-medium">Gemini AI</h2>
            <p className="text-xs text-gray-500">Powered by Google AI</p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 min-h-[calc(100vh-280px)]">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
              <h3 className="text-lg font-medium mb-2">Welcome to Gemini Chat!</h3>
              <p>Ask anything or share an image for analysis.</p>
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              content={message.content}
              imageUrl={message.image_url}
              timestamp={message.timestamp}
              isCurrentUser={message.isCurrentUser}
            />
          ))}
          {loading && (
            <div className="flex justify-center py-2">
              <div className="animate-pulse flex space-x-2">
                <div className="rounded-full bg-slate-300 h-2 w-2"></div>
                <div className="rounded-full bg-slate-300 h-2 w-2"></div>
                <div className="rounded-full bg-slate-300 h-2 w-2"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 bg-white border-t border-gray-200">
        {imagePreview && (
          <div className="relative mb-2 inline-block">
            <img 
              src={imagePreview} 
              alt="Selected" 
              className="h-24 rounded-md object-cover"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-0 right-0 rounded-full h-6 w-6 p-0"
              onClick={clearImage}
            >
              &times;
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <Button 
            variant="outline"
            size="icon"
            onClick={handleClickAttach}
            disabled={loading}
          >
            <ImagePlus className="h-5 w-5" />
          </Button>
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="min-h-[44px] resize-none"
            disabled={loading}
          />
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSendMessage}
            disabled={loading || (!newMessage.trim() && !imageFile)}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  content: string;
  imageUrl?: string | null;
  timestamp: number;
  isCurrentUser: boolean;
}

const MessageBubble = ({ content, imageUrl, timestamp, isCurrentUser }: MessageBubbleProps) => {
  const [imageError, setImageError] = useState(false);

  const getPublicUrl = async (path: string) => {
    try {
      const { data } = await supabase.storage.from('chat_images').getPublicUrl(path.replace('chat_images/', ''));
      return data.publicUrl;
    } catch (error) {
      console.error("Error getting public URL:", error);
      return null;
    }
  };

  const [publicImageUrl, setPublicImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrl && !imageError) {
      getPublicUrl(imageUrl).then(url => {
        setPublicImageUrl(url);
      });
    }
  }, [imageUrl]);

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <Card className={`p-3 max-w-[80%] ${
        isCurrentUser 
          ? "bg-blue-600 text-white" 
          : "bg-white"
      }`}>
        {imageUrl && !imageError && publicImageUrl && (
          <div className="mb-2">
            <img 
              src={publicImageUrl} 
              alt="Message attachment" 
              className="rounded-md max-w-full max-h-64 object-contain"
              onError={() => setImageError(true)}
            />
          </div>
        )}
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        <p className={`text-xs mt-1 ${isCurrentUser ? "text-white/70" : "text-gray-500"}`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </Card>
    </div>
  );
};

export default GeminiChat;
