'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Play, CheckCircle, Circle } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  videoUrl: string;
  duration: string;
  notes: string;
}

interface Module {
  id: string;
  name: string;
  topics: Topic[];
}

interface TrainingData {
  modules: Module[];
}

interface TrainingVideoClientProps {
  trainingData: TrainingData;
}

// Function to convert youtu.be URL to embed format
const convertToEmbedUrl = (url: string): string => {
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1].split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  return url;
};

export default function TrainingVideoClient({ trainingData }: TrainingVideoClientProps) {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Load completed topics from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sakhi-training-completed');
    if (saved) {
      try {
        setCompletedTopics(new Set(JSON.parse(saved)));
      } catch (error) {
        console.error('Error loading completed topics:', error);
      }
    }
  }, []);

  // Save completed topics to localStorage
  useEffect(() => {
    localStorage.setItem('sakhi-training-completed', JSON.stringify(Array.from(completedTopics)));
  }, [completedTopics]);

  // Set first module and topic as default
  useEffect(() => {
    if (trainingData.modules.length > 0 && !selectedModule) {
      const firstModule = trainingData.modules[0];
      setSelectedModule(firstModule.id);
      if (firstModule.topics.length > 0) {
        setCurrentTopic(firstModule.topics[0]);
      }
    }
  }, [trainingData.modules, selectedModule]);

  const allTopics = trainingData.modules.flatMap(module => module.topics);
  const currentIndex = allTopics.findIndex(topic => topic.id === currentTopic?.id);
  const previousTopic = currentIndex > 0 ? allTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < allTopics.length - 1 ? allTopics[currentIndex + 1] : null;

  const handleTopicChange = (topic: Topic) => {
    setCurrentTopic(topic);
  };

  const handlePreviousTopic = () => {
    if (previousTopic) {
      setCurrentTopic(previousTopic);
    }
  };

  const handleNextTopic = () => {
    if (nextTopic) {
      setCurrentTopic(nextTopic);
    }
  };

  const toggleTopicCompletion = (topicId: string) => {
    setCompletedTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  // Filter modules and topics based on search
  const filteredModules = trainingData.modules.map(module => ({
    ...module,
    topics: module.topics.filter(topic => 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.notes.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(module => module.topics.length > 0);

  const totalTopics = allTopics.length;
  const completedCount = completedTopics.size;
  const progressPercentage = totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0;

  return (
    <>
      {/* Top Navigation Bar */}
      <section className="bg-card dark:bg-[oklch(0.205_0_0)] border-b border-border px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={handlePreviousTopic}
              disabled={!previousTopic}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">
                {currentTopic?.title || 'Select a topic'}
              </h1>
              {currentTopic && (
                <p className="text-sm text-muted-foreground">
                  Duration: {currentTopic.duration}
                </p>
              )}
            </div>

            <Button 
              variant="outline" 
              onClick={handleNextTopic}
              disabled={!nextTopic}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-foreground">
                Progress: {completedCount}/{totalTopics}
              </div>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Video and Notes Section */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Video Player */}
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border">
              <CardContent className="p-0">
                {currentTopic ? (
                  <div>
                    <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                      <iframe
                        src={convertToEmbedUrl(currentTopic.videoUrl)}
                        className="w-full h-full"
                        allowFullScreen
                        title={currentTopic.title}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-foreground">
                          {currentTopic.title}
                        </h2>
                        <Button
                          onClick={() => toggleTopicCompletion(currentTopic.id)}
                          variant={completedTopics.has(currentTopic.id) ? "default" : "outline"}
                          className="flex items-center space-x-2"
                        >
                          {completedTopics.has(currentTopic.id) ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Completed</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 h-4" />
                              <span>Mark Complete</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center">
                          <Play className="w-4 h-4 mr-1" />
                          Video
                        </span>
                        <Badge variant="secondary" className="bg-secondary dark:bg-[oklch(0.205_0_0)] text-foreground">
                          Duration: {currentTopic.duration}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{currentTopic.notes}</p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-secondary dark:bg-[oklch(0.205_0_0)] rounded-t-lg flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a topic to start watching</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Modules */}
          <div className="xl:col-span-1">
            <Card className="bg-card dark:bg-[oklch(0.205_0_0)] border border-border sticky top-6">
              <CardContent className="p-4">
                <div className="mb-4">
                  <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                    Search Topics
                  </Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-4">Course Content</h3>
                
                <div className="space-y-3">
                  {filteredModules.map((module) => (
                    <div key={module.id}>
                      <button
                        onClick={() => setSelectedModule(selectedModule === module.id ? '' : module.id)}
                        className="w-full text-left p-3 bg-secondary dark:bg-[oklch(0.205_0_0)] hover:bg-muted dark:hover:bg-[oklch(0.225_0_0)] rounded-lg transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{module.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {module.topics.filter(topic => completedTopics.has(topic.id)).length}/{module.topics.length}
                            </span>
                            <ChevronRight 
                              className={`w-4 h-4 transition-transform ${selectedModule === module.id ? 'rotate-90' : ''}`} 
                            />
                          </div>
                        </div>
                      </button>
                      
                      {selectedModule === module.id && (
                        <div className="mt-2 space-y-2">
                          {module.topics.map((topic) => (
                            <div key={topic.id} className="relative group">
                              <button
                                onClick={() => handleTopicChange(topic)}
                                className={`w-full text-left p-3 rounded-lg transition-colors ${
                                  currentTopic?.id === topic.id 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-white dark:bg-[oklch(0.225_0_0)] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[oklch(0.245_0_0)] text-black dark:text-white'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  {completedTopics.has(topic.id) ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{topic.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{topic.duration}</p>
                                  </div>
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {filteredModules.length === 0 && searchTerm && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">No topics found matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

