import type { Message, TabId, ModelId, ModeId } from './types';

function createChatStore() {
  let messages = $state<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `## Repository onboarding guide

Here's a quick overview of the key scripts:

- \`npm run compile\`: Compiles TypeScript and copies HTML templates to \`out/\`.
- \`npm run watch\`: Runs the compiler in watch mode for development.
- \`npm run copy-templates\`: A helper script to ensure UI templates are correctly placed in the build directory.

### Tech Stack

- **VS Code Extension API**: Core integration.
- **TypeScript**: Main programming language.
- **HTML/Webview**: For the custom chat UI.

How would you like to proceed? I can dive into the implementation of the \`ServerManager\`, explore how the \`KeyboardProxy\` works, or help you set up the development environment.`,
      fileRefs: [
        { name: 'src/main.ts', path: 'src/main.ts', type: 'ts' },
        { name: 'src/webview/templates/loading.html', path: 'src/webview/templates/loading.html', type: 'html' },
      ],
      timestamp: new Date(),
    },
  ]);

  let activeTab = $state<TabId>('session');
  let selectedModel = $state<ModelId>('gemini-3-flash');
  let selectedMode = $state<ModeId>('build');
  let inputValue = $state('');
  let isLoading = $state(false);
  let mentionQuery = $state('');
  let showMentionPicker = $state(false);

  return {
    get messages() { return messages; },
    get activeTab() { return activeTab; },
    get selectedModel() { return selectedModel; },
    get selectedMode() { return selectedMode; },
    get inputValue() { return inputValue; },
    get isLoading() { return isLoading; },
    get mentionQuery() { return mentionQuery; },
    get showMentionPicker() { return showMentionPicker; },

    setActiveTab(tab: TabId) { activeTab = tab; },
    setSelectedModel(model: ModelId) { selectedModel = model; },
    setSelectedMode(mode: ModeId) { selectedMode = mode; },
    setInputValue(val: string) { inputValue = val; },
    setMentionQuery(val: string) { mentionQuery = val; },
    setShowMentionPicker(val: boolean) { showMentionPicker = val; },

    sendMessage(content: string) {
      if (!content.trim()) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };
      messages = [...messages, userMsg];
      inputValue = '';
      isLoading = true;

      setTimeout(() => {
        const responses = [
          `I'll help you with that. Let me analyze the codebase structure and provide a detailed response.\n\nLooking at \`src/main.ts\`, the entry point initializes the extension context and registers the \`ServerManager\`. The flow is:\n\n1. Extension activates → \`ServerManager.start()\`\n2. Server binds to localhost port\n3. Webview panel created with \`loading.html\`\n\nWould you like me to show the full initialization sequence?`,
          `Based on the repository structure, here's what I found:\n\n- **KeyboardProxy** intercepts VS Code keybindings and forwards them to the webview\n- It uses \`vscode.commands.registerTextEditorCommand\` for editor-level bindings\n- The proxy pattern decouples the UI from the extension host\n\nThis is a clean architecture choice that makes the UI testable in isolation.`,
          `I can see a few optimization opportunities:\n\n\`\`\`typescript\n// Before\nconst items = list.map(i => transform(i)).filter(i => i !== null);\n\n// After (more efficient)\nconst items = list.flatMap(i => {\n  const t = transform(i);\n  return t !== null ? [t] : [];\n});\n\`\`\`\n\nThis avoids creating an intermediate array. Shall I apply this refactor?`,
        ];
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
        };
        messages = [...messages, reply];
        isLoading = false;
      }, 1200 + Math.random() * 800);
    },
  };
}

export const chatStore = createChatStore();
