import * as React from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Heart, Send, MessageCircle, Lightbulb, Sparkles, Clock } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  type: 'remind' | 'tell' | 'wish' | 'apologetic';
  timestamp: Date;
}

const prompts = [
  { value: 'remind', label: 'Remind', icon: '💭', buttonText: 'Remind' },
  { value: 'tell', label: 'Tell', icon: '💌', buttonText: 'Tell' },
  { value: 'wish', label: "I'd like to…", icon: '🫶', buttonText: 'Wish' },
  { value: 'apologetic', label: "I know I'm being annoying, but…", icon: '🥺', buttonText: 'Share' },
];

const categoryConfig = {
  remind: { title: 'Reminders', icon: '📝', bgColor: 'cozy-pink-100', borderColor: 'border-pink-200' },
  tell: { title: 'Thoughts', icon: '💭', bgColor: 'cozy-pink-200', borderColor: 'border-pink-300' },
  wish: { title: 'Wishes', icon: '✨', bgColor: 'cozy-accent', borderColor: 'border-pink-200' },
  apologetic: { title: 'Gentle Shares', icon: '💖', bgColor: 'cozy-pink-100', borderColor: 'border-pink-300' },
};

export default function CozySpace() {
  const [message, setMessage] = React.useState('');
  const [selectedPrompt, setSelectedPrompt] = React.useState<string>('remind');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [showSpecialNote, setShowSpecialNote] = React.useState(false);

  // Load messages from localStorage on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('cozy-messages');
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
  }, []);

  // Save messages to localStorage whenever messages change
  React.useEffect(() => {
    localStorage.setItem('cozy-messages', JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      type: selectedPrompt as Message['type'],
      timestamp: new Date(),
    };

    setMessages(prev => [newMessage, ...prev]);
    setMessage('');

    // Show special note for apologetic messages
    if (selectedPrompt === 'apologetic') {
      setShowSpecialNote(true);
      setTimeout(() => setShowSpecialNote(false), 4000);
    }
  };

  const currentPrompt = prompts.find(p => p.value === selectedPrompt);
  
  // Group messages by type
  const groupedMessages = messages.reduce((acc, message) => {
    if (!acc[message.type]) acc[message.type] = [];
    acc[message.type].push(message);
    return acc;
  }, {} as Record<string, Message[]>);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen cozy-bg">
      <Head title="Cozy Space" />
      
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Subtle paw prints */}
        <div className="absolute top-20 left-10 text-pink-200 text-2xl opacity-30 paw-wiggle">🐾</div>
        <div className="absolute top-40 right-20 text-pink-200 text-xl opacity-25">🐾</div>
        <div className="absolute bottom-40 left-20 text-pink-200 text-lg opacity-20">🐾</div>
        <div className="absolute bottom-20 right-10 text-pink-200 text-xl opacity-30 paw-wiggle" style={{ animationDelay: '1s' }}>🐾</div>
        
        {/* Sleeping cat illustration */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-6xl opacity-20">😴🐱</div>
        
        {/* Yarn balls */}
        <div className="absolute top-1/3 left-5 text-pink-300 text-3xl opacity-25">🧶</div>
        <div className="absolute top-2/3 right-5 text-pink-300 text-2xl opacity-30">🧶</div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold cozy-text mb-2 flex items-center justify-center gap-3">
            <Heart className="text-pink-400" />
            Cozy Space
            <Heart className="text-pink-400" />
          </h1>
          <p className="cozy-text-secondary text-lg">Your gentle corner for thoughts, reminders, and wishes</p>
        </div>

        {/* Special note for apologetic messages */}
        {showSpecialNote && (
          <div className="mb-6 mx-auto max-w-md">
            <Card className="cozy-surface border-pink-300 shadow-lg">
              <CardContent className="pt-6 text-center">
                <p className="text-pink-600 font-medium">You're not annoying 💖</p>
                <p className="text-sm cozy-text-secondary mt-1">Your thoughts matter here</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Input form */}
        <Card className="mb-8 cozy-surface border-pink-200 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="cozy-text text-xl flex items-center gap-2">
              <Sparkles className="text-pink-400" />
              What's on your mind?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
                  <SelectTrigger className="w-full sm:w-64 cozy-border rounded-full border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="cozy-surface">
                    {prompts.map((prompt) => (
                      <SelectItem key={prompt.value} value={prompt.value}>
                        <span className="flex items-center gap-2">
                          <span>{prompt.icon}</span>
                          {prompt.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts here..."
                className="min-h-24 cozy-border rounded-2xl border-2 resize-none focus:ring-pink-300 focus:border-pink-300"
              />
              
              <Button 
                type="submit" 
                disabled={!message.trim()}
                className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-full py-6 text-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  {currentPrompt?.buttonText} {currentPrompt?.icon}
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Message history */}
        {messages.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold cozy-text flex items-center gap-2">
              <MessageCircle className="text-pink-400" />
              Your Gentle History
            </h2>
            
            {Object.entries(groupedMessages).map(([type, typeMessages]) => {
              const config = categoryConfig[type as keyof typeof categoryConfig];
              return (
                <div key={type} className="space-y-3">
                  <h3 className="text-lg font-medium cozy-text flex items-center gap-2">
                    <span>{config.icon}</span>
                    {config.title}
                    <Badge variant="outline" className="cozy-border text-pink-600">
                      {typeMessages.length}
                    </Badge>
                  </h3>
                  
                  <div className="space-y-3">
                    {typeMessages.map((msg) => (
                      <Card key={msg.id} className={`${config.bgColor} ${config.borderColor} border-2 shadow-sm hover:shadow-md transition-shadow duration-200`}>
                        <CardContent className="pt-4 pb-3">
                          <p className="cozy-text mb-2 leading-relaxed">{msg.content}</p>
                          <div className="flex items-center gap-2 text-sm cozy-text-secondary">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(msg.timestamp)} at {formatTime(msg.timestamp)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌸</div>
            <p className="cozy-text-secondary text-lg">
              Your cozy space is ready for your first thought
            </p>
          </div>
        )}
      </div>
    </div>
  );
}