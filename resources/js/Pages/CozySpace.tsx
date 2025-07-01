import * as React from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Heart, Send, MessageCircle, Lightbulb, Sparkles, Clock, Search, Sun, CloudRain, Cloud, Star, Smile, Coffee, Moon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

interface Message {
  id: string;
  content: string;
  type: 'remind' | 'tell' | 'wish' | 'apologetic';
  timestamp: Date;
  mood?: string;
}

interface Stats {
  totalMessages: number;
  kindnessStreak: number;
  lastVisit: Date;
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

const encouragingMessages = [
  "Your thoughts are beautiful 🌸",
  "You're doing great today 💖",
  "Thank you for sharing your heart 🫶",
  "Your feelings are valid and important ✨",
  "You bring light to this space 🌟",
  "Take a gentle breath, you're safe here 🍃",
  "Your presence here matters 💝",
  "You're braver than you know 🦋"
];

const gentleSuggestions = [
  "Maybe try writing about something that made you smile today?",
  "What's one small thing you're grateful for right now?",
  "Is there a dream you'd like to gently explore?",
  "How are you feeling in your heart at this moment?",
  "What would you tell a dear friend who needs comfort?"
];

const moodEmojis = {
  happy: '😊',
  peaceful: '😌',
  hopeful: '🌟',
  grateful: '🙏',
  thoughtful: '💭',
  cozy: '🫖',
  loved: '💝',
  creative: '🎨'
};

export default function CozySpace() {
  const [message, setMessage] = React.useState('');
  const [selectedPrompt, setSelectedPrompt] = React.useState<string>('remind');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [showSpecialNote, setShowSpecialNote] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [stats, setStats] = React.useState<Stats>({ totalMessages: 0, kindnessStreak: 0, lastVisit: new Date() });
  const [currentEncouragement, setCurrentEncouragement] = React.useState('');
  const [showBreathingReminder, setShowBreathingReminder] = React.useState(false);
  const [selectedMood, setSelectedMood] = React.useState<string>('');
  const [weather, setWeather] = React.useState<'sunny' | 'rainy' | 'cloudy'>('sunny');
  const [showSuggestion, setShowSuggestion] = React.useState(false);
  const [showWelcome, setShowWelcome] = React.useState(false);

  // Load messages and stats from localStorage on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem('cozy-messages');
    const savedStats = localStorage.getItem('cozy-stats');
    const hasVisited = localStorage.getItem('cozy-visited');
    
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
    
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      setStats({
        ...parsedStats,
        lastVisit: new Date(parsedStats.lastVisit)
      });
    }

    // Show welcome modal for first-time visitors
    if (!hasVisited) {
      setTimeout(() => setShowWelcome(true), 1500);
      localStorage.setItem('cozy-visited', 'true');
    }

    // Show welcome encouragement
    setTimeout(() => {
      setCurrentEncouragement(encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]);
    }, 1000);

    // Breathing reminder every 10 minutes
    const breathingInterval = setInterval(() => {
      setShowBreathingReminder(true);
      setTimeout(() => setShowBreathingReminder(false), 8000);
    }, 600000);

    // Random weather changes for ambiance
    const weatherInterval = setInterval(() => {
      const weathers: ('sunny' | 'rainy' | 'cloudy')[] = ['sunny', 'rainy', 'cloudy'];
      setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
    }, 120000);

    return () => {
      clearInterval(breathingInterval);
      clearInterval(weatherInterval);
    };
  }, []);

  // Save messages and stats to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('cozy-messages', JSON.stringify(messages));
    const newStats = {
      ...stats,
      totalMessages: messages.length,
      kindnessStreak: calculateKindnessStreak(),
      lastVisit: new Date()
    };
    setStats(newStats);
    localStorage.setItem('cozy-stats', JSON.stringify(newStats));
  }, [messages]);

  const calculateKindnessStreak = () => {
    const today = new Date();
    let streak = 0;
    const dayInMs = 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - (i * dayInMs));
      const hasMessageOnDay = messages.some(msg => 
        msg.timestamp.toDateString() === checkDate.toDateString()
      );
      
      if (hasMessageOnDay) {
        streak++;
      } else if (i === 0) {
        break; // If no message today, streak ends
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      type: selectedPrompt as Message['type'],
      timestamp: new Date(),
      mood: selectedMood
    };

    setMessages(prev => [newMessage, ...prev]);
    setMessage('');
    setSelectedMood('');

    // Show celebration for milestones
    if ((messages.length + 1) % 5 === 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }

    // Show special note for apologetic messages
    if (selectedPrompt === 'apologetic') {
      setShowSpecialNote(true);
      setTimeout(() => setShowSpecialNote(false), 5000);
    }

    // Random encouragement
    if (Math.random() < 0.3) {
      setTimeout(() => {
        setCurrentEncouragement(encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]);
        setTimeout(() => setCurrentEncouragement(''), 4000);
      }, 1000);
    }

    // Show suggestion occasionally
    if (Math.random() < 0.2 && messages.length < 3) {
      setTimeout(() => {
        setShowSuggestion(true);
        setTimeout(() => setShowSuggestion(false), 8000);
      }, 2000);
    }
  };

  const currentPrompt = prompts.find(p => p.value === selectedPrompt);
  
  // Group and filter messages
  const filteredMessages = messages.filter(msg => 
    msg.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const groupedMessages = filteredMessages.reduce((acc, message) => {
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

  const getWeatherGradient = () => {
    switch (weather) {
      case 'sunny': return 'sunny-gradient';
      case 'rainy': return 'rainy-gradient';
      case 'cloudy': return 'cloudy-gradient';
      default: return 'cozy-bg';
    }
  };

  const getWeatherIcon = () => {
    switch (weather) {
      case 'sunny': return <Sun className="text-yellow-400" />;
      case 'rainy': return <CloudRain className="text-blue-400" />;
      case 'cloudy': return <Cloud className="text-gray-400" />;
    }
  };

  return (
    <div className={`min-h-screen ${getWeatherGradient()}`}>
      <Head title="Cozy Space" />
      
      {/* Welcome Modal */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="cozy-surface border-pink-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center cozy-text flex items-center justify-center gap-2 text-2xl">
              <Heart className="text-pink-400" />
              Welcome to your Cozy Space
              <Heart className="text-pink-400" />
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🌸</div>
              <p className="cozy-text-secondary leading-relaxed">
                This is your gentle sanctuary for thoughts, reminders, and wishes. 
                Here, every feeling is valid and every thought matters.
              </p>
            </div>
            
            <div className="space-y-3 text-sm cozy-text-secondary">
              <div className="flex items-center gap-3">
                <span className="text-lg">💭</span>
                <span>Share reminders, thoughts, wishes, or gentle worries</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🎭</span>
                <span>Track your mood and see your emotional journey</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🌟</span>
                <span>Build kindness streaks and celebrate milestones</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🍃</span>
                <span>Receive gentle breathing reminders and encouragement</span>
              </div>
            </div>
            
            <div className="text-center pt-4">
              <Button 
                onClick={() => setShowWelcome(false)}
                className="bg-pink-400 hover:bg-pink-500 text-white rounded-full px-8 py-2 glow-effect"
              >
                Begin my gentle journey 🌸
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Floating hearts */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-pink-300 text-lg opacity-40 float-heart">💖</div>
        <div className="absolute top-3/4 right-1/4 text-pink-300 text-lg opacity-40 float-heart" style={{ animationDelay: '2s' }}>💝</div>
        <div className="absolute top-1/2 left-1/6 text-pink-300 text-lg opacity-40 float-heart" style={{ animationDelay: '4s' }}>💕</div>
      </div>
      
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Enhanced paw prints */}
        <div className="absolute top-20 left-10 text-pink-200 text-2xl opacity-30 paw-wiggle">🐾</div>
        <div className="absolute top-40 right-20 text-pink-200 text-xl opacity-25">🐾</div>
        <div className="absolute bottom-40 left-20 text-pink-200 text-lg opacity-20">🐾</div>
        <div className="absolute bottom-20 right-10 text-pink-200 text-xl opacity-30 paw-wiggle" style={{ animationDelay: '1s' }}>🐾</div>
        
        {/* Enhanced sleeping cat with breathing */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-6xl opacity-20 gentle-breathing">😴🐱</div>
        
        {/* Enhanced yarn balls with gentle pulse */}
        <div className="absolute top-1/3 left-5 text-pink-300 text-3xl opacity-25 gentle-pulse">🧶</div>
        <div className="absolute top-2/3 right-5 text-pink-300 text-2xl opacity-30 gentle-pulse" style={{ animationDelay: '1.5s' }}>🧶</div>
        
        {/* Sparkles */}
        <div className="absolute top-10 right-1/3 text-yellow-300 text-sm opacity-50 sparkle">✨</div>
        <div className="absolute bottom-1/3 left-10 text-yellow-300 text-sm opacity-50 sparkle" style={{ animationDelay: '3s' }}>✨</div>
      </div>

      {/* Celebration effect */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="celebration-burst text-6xl">🎉</div>
          <div className="celebration-burst text-4xl" style={{ animationDelay: '0.2s' }}>🌟</div>
          <div className="celebration-burst text-5xl" style={{ animationDelay: '0.4s' }}>💖</div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Enhanced Header with Weather and Stats */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-4xl font-bold cozy-text mb-2 flex items-center justify-center gap-3">
              <Heart className="text-pink-400" />
              Cozy Space
              <Heart className="text-pink-400" />
            </h1>
            <div className="ml-4">{getWeatherIcon()}</div>
          </div>
          <p className="cozy-text-secondary text-lg mb-4">Your gentle corner for thoughts, reminders, and wishes</p>
          
          {/* Stats bar */}
          <div className="flex justify-center gap-6 mb-4">
            <Badge variant="outline" className="cozy-border text-pink-600 px-4 py-2">
              <MessageCircle className="w-4 h-4 mr-2" />
              {stats.totalMessages} thoughts shared
            </Badge>
            {stats.kindnessStreak > 0 && (
              <Badge variant="outline" className="cozy-border text-pink-600 px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                {stats.kindnessStreak} day kindness streak
              </Badge>
            )}
          </div>
        </div>

        {/* Breathing reminder */}
        {showBreathingReminder && (
          <div className="mb-6 mx-auto max-w-md">
            <Card className="cozy-surface border-blue-200 shadow-lg gentle-breathing">
              <CardContent className="pt-6 text-center">
                <p className="text-blue-600 font-medium">Take a gentle breath 🍃</p>
                <p className="text-sm cozy-text-secondary mt-1">In... and out... you're doing beautifully</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Encouragement */}
        {currentEncouragement && (
          <div className="mb-6 mx-auto max-w-md">
            <Card className="cozy-surface border-pink-300 shadow-lg glow-effect">
              <CardContent className="pt-6 text-center">
                <p className="text-pink-600 font-medium">{currentEncouragement}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gentle suggestion */}
        {showSuggestion && (
          <div className="mb-6 mx-auto max-w-md">
            <Card className="cozy-surface border-purple-200 shadow-lg">
              <CardContent className="pt-6 text-center">
                <p className="text-purple-600 font-medium mb-2">💭 Gentle suggestion</p>
                <p className="text-sm cozy-text-secondary">
                  {gentleSuggestions[Math.floor(Math.random() * gentleSuggestions.length)]}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Special note for apologetic messages */}
        {showSpecialNote && (
          <div className="mb-6 mx-auto max-w-md">
            <Card className="cozy-surface border-pink-300 shadow-lg glow-effect">
              <CardContent className="pt-6 text-center">
                <p className="text-pink-600 font-medium">You're not annoying 💖</p>
                <p className="text-sm cozy-text-secondary mt-1">Your thoughts matter here, always</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Input form */}
        <Card className="mb-8 cozy-surface border-pink-200 shadow-lg cozy-shadow">
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
                
                {/* Mood selector */}
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="w-full sm:w-48 cozy-border rounded-full border-2">
                    <SelectValue placeholder="How are you feeling?" />
                  </SelectTrigger>
                  <SelectContent className="cozy-surface">
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                      <SelectItem key={mood} value={mood}>
                        <span className="flex items-center gap-2">
                          <span>{emoji}</span>
                          {mood}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts here... you're safe in this space 💝"
                className="min-h-24 cozy-border rounded-2xl border-2 resize-none focus:ring-pink-300 focus:border-pink-300"
              />
              
              <Button 
                type="submit" 
                disabled={!message.trim()}
                className="w-full bg-pink-400 hover:bg-pink-500 text-white rounded-full py-6 text-lg font-medium shadow-lg transition-all duration-200 disabled:opacity-50 hover:glow-effect"
              >
                <span className="flex items-center gap-2">
                  {currentPrompt?.buttonText} {currentPrompt?.icon}
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Search bar */}
        {messages.length > 3 && (
          <Card className="mb-6 cozy-surface border-pink-200 shadow-lg">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 w-4 h-4" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search your gentle thoughts..."
                  className="pl-10 cozy-border rounded-full border-2"
                />
              </div>
            </CardContent>
          </Card>
        )}

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
                      <Card key={msg.id} className={`${config.bgColor} ${config.borderColor} border-2 shadow-sm hover:shadow-md transition-all duration-200 message-appear hover:cozy-shadow`}>
                        <CardContent className="pt-4 pb-3">
                          <div className="flex justify-between items-start mb-2">
                            <p className="cozy-text leading-relaxed flex-1">{msg.content}</p>
                            {msg.mood && (
                              <span className="ml-2 text-lg">
                                {moodEmojis[msg.mood as keyof typeof moodEmojis]}
                              </span>
                            )}
                          </div>
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

        {filteredMessages.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="cozy-text-secondary text-lg">
              No thoughts found matching "{searchTerm}"
            </p>
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌸</div>
            <p className="cozy-text-secondary text-lg mb-4">
              Your cozy space is ready for your first thought
            </p>
            <p className="cozy-text-secondary text-sm">
              This is a safe space for all your feelings 💝
            </p>
          </div>
        )}
      </div>
    </div>
  );
}