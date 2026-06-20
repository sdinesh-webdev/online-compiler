export const TAILWIND_CLASSES: string[] = [
  // Layout
  'container','block','inline-block','inline','flex','inline-flex','table','grid','inline-grid','hidden',
  'static','fixed','absolute','relative','sticky',
  'top-0','top-1','top-2','top-4','top-8','top-auto','top-full',
  'bottom-0','bottom-1','bottom-2','bottom-4','bottom-8','bottom-auto','bottom-full',
  'left-0','left-1','left-2','left-4','left-8','left-auto','left-full',
  'right-0','right-1','right-2','right-4','right-8','right-auto','right-full',
  'inset-0','inset-x-0','inset-y-0',
  'z-0','z-10','z-20','z-30','z-40','z-50','z-auto',
  'overflow-auto','overflow-hidden','overflow-visible','overflow-scroll','overflow-x-auto','overflow-y-auto',
  // Flexbox
  'flex-row','flex-col','flex-row-reverse','flex-col-reverse','flex-wrap','flex-nowrap',
  'items-start','items-center','items-end','items-baseline','items-stretch',
  'justify-start','justify-center','justify-end','justify-between','justify-around','justify-evenly',
  'flex-1','flex-auto','flex-none','flex-grow','flex-shrink',
  'self-auto','self-start','self-center','self-end','self-stretch',
  'gap-0','gap-1','gap-2','gap-3','gap-4','gap-5','gap-6','gap-8','gap-10','gap-12','gap-16',
  'gap-x-1','gap-x-2','gap-x-4','gap-x-6','gap-x-8',
  'gap-y-1','gap-y-2','gap-y-4','gap-y-6','gap-y-8',
  // Grid
  'grid-cols-1','grid-cols-2','grid-cols-3','grid-cols-4','grid-cols-5','grid-cols-6','grid-cols-12',
  'col-span-1','col-span-2','col-span-3','col-span-4','col-span-full',
  'row-span-1','row-span-2','row-span-3','row-span-full',
  // Spacing (padding)
  'p-0','p-1','p-2','p-3','p-4','p-5','p-6','p-8','p-10','p-12','p-16','p-20','p-24',
  'px-0','px-1','px-2','px-3','px-4','px-5','px-6','px-8','px-10','px-12','px-16',
  'py-0','py-1','py-2','py-3','py-4','py-5','py-6','py-8','py-10','py-12','py-16',
  'pt-0','pt-1','pt-2','pt-4','pt-6','pt-8','pt-10','pt-12','pt-16',
  'pb-0','pb-1','pb-2','pb-4','pb-6','pb-8','pb-10','pb-12','pb-16',
  'pl-0','pl-1','pl-2','pl-4','pl-6','pl-8','pl-10','pl-12',
  'pr-0','pr-1','pr-2','pr-4','pr-6','pr-8','pr-10','pr-12',
  // Spacing (margin)
  'm-0','m-1','m-2','m-3','m-4','m-5','m-6','m-8','m-10','m-12','m-16','m-auto',
  'mx-0','mx-1','mx-2','mx-4','mx-6','mx-8','mx-auto',
  'my-0','my-1','my-2','my-4','my-6','my-8','my-auto',
  'mt-0','mt-1','mt-2','mt-4','mt-6','mt-8','mt-10','mt-12','mt-16',
  'mb-0','mb-1','mb-2','mb-4','mb-6','mb-8','mb-10','mb-12','mb-16',
  'ml-0','ml-1','ml-2','ml-4','ml-6','ml-8','ml-auto',
  'mr-0','mr-1','mr-2','mr-4','mr-6','mr-8','mr-auto',
  // Sizing
  'w-0','w-1','w-2','w-4','w-6','w-8','w-10','w-12','w-16','w-20','w-24','w-32','w-40','w-48','w-56','w-64',
  'w-auto','w-full','w-screen','w-min','w-max','w-fit',
  'w-1/2','w-1/3','w-2/3','w-1/4','w-3/4','w-1/5','w-2/5','w-3/5','w-4/5',
  'h-0','h-1','h-2','h-4','h-6','h-8','h-10','h-12','h-16','h-20','h-24','h-32','h-40','h-48','h-56','h-64',
  'h-auto','h-full','h-screen','h-min','h-max','h-fit',
  'min-w-0','min-w-full','min-w-min','min-w-max',
  'max-w-xs','max-w-sm','max-w-md','max-w-lg','max-w-xl','max-w-2xl','max-w-3xl','max-w-4xl','max-w-5xl','max-w-6xl','max-w-full','max-w-screen-sm','max-w-screen-md','max-w-screen-lg','max-w-screen-xl',
  'min-h-0','min-h-full','min-h-screen',
  'max-h-full','max-h-screen','max-h-64','max-h-96',
  // Typography
  'text-xs','text-sm','text-base','text-lg','text-xl','text-2xl','text-3xl','text-4xl','text-5xl','text-6xl','text-7xl','text-8xl','text-9xl',
  'font-thin','font-extralight','font-light','font-normal','font-medium','font-semibold','font-bold','font-extrabold','font-black',
  'font-sans','font-serif','font-mono',
  'text-left','text-center','text-right','text-justify',
  'leading-none','leading-tight','leading-snug','leading-normal','leading-relaxed','leading-loose',
  'tracking-tighter','tracking-tight','tracking-normal','tracking-wide','tracking-wider','tracking-widest',
  'uppercase','lowercase','capitalize','normal-case',
  'underline','line-through','no-underline',
  'italic','not-italic',
  'truncate','text-ellipsis','text-clip','whitespace-nowrap','whitespace-pre','whitespace-normal',
  'list-none','list-disc','list-decimal',
  // Colors - Text
  'text-transparent','text-current','text-black','text-white',
  'text-slate-50','text-slate-100','text-slate-200','text-slate-300','text-slate-400','text-slate-500','text-slate-600','text-slate-700','text-slate-800','text-slate-900',
  'text-gray-50','text-gray-100','text-gray-200','text-gray-300','text-gray-400','text-gray-500','text-gray-600','text-gray-700','text-gray-800','text-gray-900',
  'text-red-50','text-red-100','text-red-200','text-red-300','text-red-400','text-red-500','text-red-600','text-red-700','text-red-800','text-red-900',
  'text-orange-400','text-orange-500','text-orange-600',
  'text-yellow-400','text-yellow-500','text-yellow-600',
  'text-green-400','text-green-500','text-green-600','text-green-700',
  'text-blue-400','text-blue-500','text-blue-600','text-blue-700',
  'text-indigo-400','text-indigo-500','text-indigo-600',
  'text-purple-400','text-purple-500','text-purple-600',
  'text-pink-400','text-pink-500','text-pink-600',
  'text-cyan-400','text-cyan-500','text-cyan-600',
  'text-teal-400','text-teal-500','text-teal-600',
  'text-emerald-400','text-emerald-500','text-emerald-600',
  // Colors - Background
  'bg-transparent','bg-current','bg-black','bg-white',
  'bg-slate-50','bg-slate-100','bg-slate-200','bg-slate-300','bg-slate-400','bg-slate-500','bg-slate-600','bg-slate-700','bg-slate-800','bg-slate-900','bg-slate-950',
  'bg-gray-50','bg-gray-100','bg-gray-200','bg-gray-300','bg-gray-400','bg-gray-500','bg-gray-600','bg-gray-700','bg-gray-800','bg-gray-900','bg-gray-950',
  'bg-zinc-800','bg-zinc-900','bg-zinc-950',
  'bg-neutral-800','bg-neutral-900',
  'bg-red-50','bg-red-100','bg-red-400','bg-red-500','bg-red-600','bg-red-700',
  'bg-orange-400','bg-orange-500',
  'bg-yellow-400','bg-yellow-500',
  'bg-green-400','bg-green-500','bg-green-600','bg-green-700',
  'bg-blue-400','bg-blue-500','bg-blue-600','bg-blue-700','bg-blue-800','bg-blue-900',
  'bg-indigo-400','bg-indigo-500','bg-indigo-600','bg-indigo-900',
  'bg-violet-500','bg-violet-600','bg-violet-900',
  'bg-purple-400','bg-purple-500','bg-purple-600','bg-purple-900',
  'bg-pink-400','bg-pink-500','bg-pink-600',
  'bg-cyan-400','bg-cyan-500','bg-cyan-600',
  'bg-teal-400','bg-teal-500','bg-teal-600',
  'bg-emerald-400','bg-emerald-500','bg-emerald-600',
  // Gradients
  'bg-gradient-to-t','bg-gradient-to-tr','bg-gradient-to-r','bg-gradient-to-br','bg-gradient-to-b','bg-gradient-to-bl','bg-gradient-to-l','bg-gradient-to-tl',
  'from-transparent','from-white','from-black','from-blue-500','from-purple-500','from-pink-500','from-indigo-500','from-cyan-500','from-green-500',
  'via-transparent','via-white','via-blue-500','via-purple-500',
  'to-transparent','to-white','to-black','to-blue-500','to-purple-500','to-pink-500','to-indigo-500','to-cyan-500','to-green-500',
  // Borders
  'border','border-0','border-2','border-4','border-8',
  'border-t','border-b','border-l','border-r','border-x','border-y',
  'border-solid','border-dashed','border-dotted','border-double','border-hidden','border-none',
  'border-transparent','border-current','border-black','border-white',
  'border-gray-200','border-gray-300','border-gray-400','border-gray-500','border-gray-600','border-gray-700',
  'border-blue-400','border-blue-500','border-red-500','border-green-500','border-yellow-500',
  'rounded','rounded-none','rounded-sm','rounded-md','rounded-lg','rounded-xl','rounded-2xl','rounded-3xl','rounded-full',
  'rounded-t','rounded-b','rounded-l','rounded-r','rounded-tl','rounded-tr','rounded-bl','rounded-br',
  // Shadows
  'shadow','shadow-sm','shadow-md','shadow-lg','shadow-xl','shadow-2xl','shadow-none','shadow-inner',
  'ring','ring-0','ring-1','ring-2','ring-4','ring-8','ring-inset',
  'ring-transparent','ring-white','ring-black','ring-blue-500','ring-gray-500',
  // Opacity
  'opacity-0','opacity-5','opacity-10','opacity-20','opacity-25','opacity-30','opacity-40','opacity-50','opacity-60','opacity-70','opacity-75','opacity-80','opacity-90','opacity-95','opacity-100',
  // Transitions & Animation
  'transition','transition-all','transition-colors','transition-opacity','transition-shadow','transition-transform','transition-none',
  'duration-75','duration-100','duration-150','duration-200','duration-300','duration-500','duration-700','duration-1000',
  'ease-linear','ease-in','ease-out','ease-in-out',
  'delay-75','delay-100','delay-150','delay-200','delay-300','delay-500',
  'animate-none','animate-spin','animate-ping','animate-pulse','animate-bounce',
  // Transform
  'scale-0','scale-50','scale-75','scale-90','scale-95','scale-100','scale-105','scale-110','scale-125','scale-150',
  'rotate-0','rotate-1','rotate-2','rotate-3','rotate-6','rotate-12','rotate-45','rotate-90','rotate-180',
  'translate-x-0','translate-x-1','translate-x-2','translate-x-4','translate-x-full',
  'translate-y-0','translate-y-1','translate-y-2','translate-y-4','translate-y-full',
  'skew-x-0','skew-x-1','skew-x-2','skew-x-3','skew-x-6','skew-x-12',
  '-translate-x-full','-translate-y-full','-rotate-6','-rotate-12','-rotate-45','-rotate-90',
  'transform','transform-gpu','transform-none',
  // Cursor & Interaction
  'cursor-auto','cursor-default','cursor-pointer','cursor-wait','cursor-text','cursor-move','cursor-not-allowed','cursor-grab','cursor-grabbing',
  'pointer-events-none','pointer-events-auto',
  'select-none','select-text','select-all','select-auto',
  'resize','resize-none','resize-x','resize-y',
  // Display / Visibility
  'visible','invisible','collapse',
  'sr-only','not-sr-only',
  // Object fit
  'object-contain','object-cover','object-fill','object-none','object-scale-down',
  'object-center','object-top','object-bottom','object-left','object-right',
  // Aspect ratio
  'aspect-auto','aspect-square','aspect-video',
  // Hover, Focus variants
  'hover:bg-blue-600','hover:bg-blue-700','hover:text-white','hover:text-blue-500','hover:opacity-80','hover:opacity-90',
  'hover:scale-105','hover:shadow-lg','hover:border-blue-500','hover:underline',
  'focus:outline-none','focus:ring-2','focus:ring-blue-500','focus:ring-offset-2','focus:border-blue-500',
  'active:scale-95','active:opacity-80',
  'disabled:opacity-50','disabled:cursor-not-allowed',
  // Responsive prefixes hint
  'sm:','md:','lg:','xl:','2xl:',
  // Dark mode
  'dark:bg-gray-800','dark:bg-gray-900','dark:text-white','dark:text-gray-100','dark:border-gray-700',
  // Space between
  'space-x-1','space-x-2','space-x-4','space-x-8',
  'space-y-1','space-y-2','space-y-4','space-y-8',
  // Divide
  'divide-x','divide-y','divide-gray-200','divide-gray-700',
  // Backdrop
  'backdrop-blur-sm','backdrop-blur','backdrop-blur-md','backdrop-blur-lg','backdrop-blur-xl',
  'backdrop-brightness-50','backdrop-brightness-75','backdrop-brightness-100',
  'backdrop-opacity-10','backdrop-opacity-20','backdrop-opacity-50',
  // Overflow
  'overflow-clip','overflow-ellipsis',
  // Word break
  'break-normal','break-words','break-all',
];

export function registerTailwindCompletions(monaco: any) {
  const triggerRegex = /(?:className|class)\s*=\s*["'`]([^"'`]*)$/;

  const provider = {
    triggerCharacters: ['"', "'", '`', ' ', '-'],
    provideCompletionItems(model: any, position: any) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const match = triggerRegex.exec(textUntilPosition);
      if (!match) return { suggestions: [] };

      const classStr = match[1];
      const lastSpace = classStr.lastIndexOf(' ');
      const currentWord = classStr.substring(lastSpace + 1);
      const wordRange = new monaco.Range(
        position.lineNumber,
        position.column - currentWord.length,
        position.lineNumber,
        position.column,
      );

      const suggestions = TAILWIND_CLASSES
        .filter(cls => cls.toLowerCase().startsWith(currentWord.toLowerCase()))
        .map(cls => ({
          label: cls,
          kind: monaco.languages.CompletionItemKind.Value,
          insertText: cls,
          range: wordRange,
          detail: 'Tailwind CSS',
          documentation: { value: `\`${cls}\`` },
          sortText: '00' + cls,
        }));

      return { suggestions };
    }
  };

  ['javascript', 'typescript', 'html'].forEach(lang => {
    monaco.languages.registerCompletionItemProvider(lang, provider);
  });
}
