// Add to imports at top:
import AIAssistantKnowledgeBase from '../components/AIAssistantKnowledgeBase';

// Add this new route in the Routes section (after CADStudio route):
<Route path="/ai-knowledge" element={
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AIAssistantKnowledgeBase />
    </div>
  </div>
} />
