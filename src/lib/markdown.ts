/**
 * Markdown Formatting Utilities
 * 
 * Simple markdown parser for chat message formatting
 */

/**
 * Parses markdown text and returns formatted HTML string
 * Basic markdown elements: **bold**, *italic*, `code`, ```code blocks```, # headings, > quotes, lists, tables
 */
export function parseMarkdown(text: string): string {
  if (!text) return '';

  let html = text;

  // Handle code blocks first (they shouldn't be processed further)
  const codeBlocks: string[] = [];
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const index = codeBlocks.length;
    const escapedCode = escapeHtml(code.trim());
    codeBlocks.push(`<pre class="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg my-2 overflow-x-auto border border-gray-200 dark:border-gray-700"><code class="text-sm text-gray-800 dark:text-gray-200 font-mono">${escapedCode}</code></pre>`);
    return `__CODE_BLOCK_${index}__`;
  });

  // Handle inline code - protect from HTML processing
  const inlineCodeBlocks: string[] = [];
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const index = inlineCodeBlocks.length;
    const escapedCode = escapeHtml(code);
    inlineCodeBlocks.push(`<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">${escapedCode}</code>`);
    return `__INLINE_CODE_${index}__`;
  });

  // Handle headers (must be before other line-based processing)
  html = html.replace(/^### (.*)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100">$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-3 text-gray-900 dark:text-gray-100">$1</h1>');

  // Remove horizontal rules (--- or ***)
  html = html.replace(/^[-*]{3,}\s*$/gm, '');

  // Handle blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-blue-500 dark:border-blue-400 pl-4 py-2 my-2 bg-blue-50 dark:bg-blue-900/20 italic text-gray-700 dark:text-gray-300 rounded-r">$1</blockquote>');

  // Handle bold text first (**text** or __text__)
  html = html.replace(/\*\*([^*]+?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');
  html = html.replace(/__([^_]+?)__/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');

  // Handle italic text (*text* or _text_) after bold to avoid conflicts
  html = html.replace(/\*([^*\n]+?)\*/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>');
  html = html.replace(/\b_([^_\n]+?)_\b/g, '<em class="italic text-gray-800 dark:text-gray-200">$1</em>');

  // Handle links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>');

  // Handle tables before lists to avoid conflicts
  html = processTables(html);

  // Handle lists after other formatting
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listItems: string[] = [];
  let isOrderedList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check for list items
    const unorderedMatch = line.match(/^(\s*)[*-]\s(.+)$/);
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s(.+)$/);
    
    if (unorderedMatch || orderedMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
        isOrderedList = !!orderedMatch;
      }
      
      const content = unorderedMatch ? unorderedMatch[2] : orderedMatch?.[3] || '';
      listItems.push(`<li class="ml-4">${content}</li>`);
      isOrderedList = isOrderedList || !!orderedMatch;
    } else {
      // End of list
      if (inList && listItems.length > 0) {
        const listTag = isOrderedList ? 'ol' : 'ul';
        const listClass = isOrderedList ? 'list-decimal list-inside' : 'list-disc list-inside';
        processedLines.push(`<${listTag} class="${listClass} my-2 space-y-1">${listItems.join('')}</${listTag}>`);
        inList = false;
        listItems = [];
      }
      
      processedLines.push(line);
    }
  }
  
  // Handle any remaining list
  if (inList && listItems.length > 0) {
    const listTag = isOrderedList ? 'ol' : 'ul';
    const listClass = isOrderedList ? 'list-decimal list-inside' : 'list-disc list-inside';
    processedLines.push(`<${listTag} class="${listClass} my-2 space-y-1">${listItems.join('')}</${listTag}>`);
  }
  
  html = processedLines.join('\n');

  // Restore inline code blocks
  inlineCodeBlocks.forEach((block, index) => {
    html = html.replace(`__INLINE_CODE_${index}__`, block);
  });

  // Restore code blocks
  codeBlocks.forEach((block, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, block);
  });

  // Escape HTML characters in text content only
  html = escapeHtmlInText(html);

  // Handle line breaks and paragraphs
  html = processParagraphs(html);

  return html;
}

/**
 * Escapes HTML characters in text content while preserving HTML tags
 */
function escapeHtmlInText(html: string): string {
  const parts = html.split(/(<[^>]*>)/);
  return parts.map((part, index) => {
    if (index % 2 === 0) {
      // This is text content, escape HTML
      return escapeHtml(part);
    }
    return part; // This is an HTML tag, keep as-is
  }).join('');
}

/**
 * Processes markdown tables and converts them to HTML
 */
function processTables(html: string): string {
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Check if this line looks like a table header (contains |)
    if (line.includes('|') && line.length > 0) {
      const tableLines: string[] = [];
      let j = i;
      
      // Collect all consecutive table lines
      while (j < lines.length && lines[j].trim().includes('|')) {
        tableLines.push(lines[j]);
        j++;
      }
      
      // Check if we have a proper table (at least 2 lines and a separator line)
      if (tableLines.length >= 2 && isTableSeparator(tableLines[1])) {
        const tableHtml = convertTableToHtml(tableLines);
        processedLines.push(tableHtml);
        i = j; // Skip the processed table lines
        continue;
      }
    }
    
    processedLines.push(lines[i]);
    i++;
  }
  
  return processedLines.join('\n');
}

/**
 * Checks if a line is a table separator (contains | and dashes/colons)
 */
function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.includes('|') && /^[\|\-\:\s]+$/.test(trimmed);
}

/**
 * Converts table lines to HTML table
 */
function convertTableToHtml(tableLines: string[]): string {
  if (tableLines.length < 2) return tableLines.join('\n');
  
  // Skip the separator line (usually index 1)
  const headerLine = tableLines[0];
  const dataLines = tableLines.slice(2); // Skip header and separator
  
  // Parse header row
  const headerCells = parseTableRow(headerLine);
  
  // Parse data rows
  const dataRows = dataLines.map(line => parseTableRow(line));
  
  // Build HTML table
  const headerHtml = headerCells.map(cell => 
    `<th class="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 border-b-2 border-gray-200 dark:border-gray-600">${cell}</th>`
  ).join('');
  
  const rowsHtml = dataRows.map(row => {
    const cellsHtml = row.map(cell => 
      `<td class="px-4 py-3 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">${cell}</td>`
    ).join('');
    return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50">${cellsHtml}</tr>`;
  }).join('');
  
  return `<div class="overflow-x-auto my-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
      <thead class="bg-gray-50 dark:bg-gray-700/50">
        <tr>${headerHtml}</tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        ${rowsHtml}
      </tbody>
    </table>
  </div>`;
}

/**
 * Parses a table row and returns array of cell contents
 */
function parseTableRow(line: string): string[] {
  // Remove leading/trailing pipes and split by |, then trim each cell
  const trimmed = line.trim();
  const cells = trimmed.split('|').map(cell => cell.trim());
  
  // Remove empty cells at the beginning/end that might be created by leading/trailing pipes
  if (cells.length > 0 && cells[0] === '') cells.shift();
  if (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
  
  return cells;
}

/**
 * Processes paragraphs and wraps content appropriately
 */
function processParagraphs(html: string): string {
  // Split by double line breaks to identify paragraphs
  const parts = html.split(/\n\s*\n/g);
  
  return parts.map(part => {
    const trimmed = part.trim();
    if (!trimmed) return '';
    
    // Don't wrap if it's already a block element
    if (trimmed.match(/^<(h[1-6]|blockquote|pre|ul|ol|table|div)/) || trimmed.includes('<div class="overflow-x-auto')) {
      return trimmed;
    }
    
    // Convert single line breaks to <br> and wrap in paragraph
    const content = trimmed.replace(/\n/g, '<br>');
    return `<p class="mb-3 leading-relaxed text-gray-800 dark:text-gray-200">${content}</p>`;
  }).filter(p => p).join('');
}

/**
 * Helper function to escape HTML characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats text with basic markdown support for chat messages
 * Returns JSX-compatible string
 */
export function formatMarkdownForChat(text: string): string {
  return parseMarkdown(text);
}

/**
 * Simple function to detect if text contains markdown
 */
export function containsMarkdown(text: string): boolean {
  const markdownPatterns = [
    /\*\*.*?\*\*/,        // **bold**
    /\*.*?\*/,            // *italic*
    /`.*?`/,              // `code`
    /```[\s\S]*?```/,     // ```code blocks```
    /^#{1,6}\s/m,         // headers
    /^>\s/m,              // blockquotes
    /\[.*?\]\(.*?\)/,     // links
    /^[\s]*[*-]\s/m,      // unordered lists
    /^[\s]*\d+\.\s/m,     // ordered lists
    /__.*?__/,            // __bold alternative__
    /\b_.*?_\b/,          // _italic alternative_
    /\|.*\|/m,            // tables (lines with pipes)
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}
