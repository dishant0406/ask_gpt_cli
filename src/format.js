function convertMarkdownToFormattedText(mdString) {
  // Headers
  mdString = mdString.replace(/(#{1,6})\s(.+)/g, function (_, hashes, content) {
    let level = hashes.length;
    return '\n' + ' '.repeat(level - 1) + content.toUpperCase() + '\n';
  });

  // Newlines
  mdString = mdString.replace(/\n/g, '\n');

  // Code blocks
  mdString = mdString.replace(/```([^`]+)```/g, function (_, content) {
    return '\n[CODE]\n' + content + '\n[/CODE]\n';
  });

  // Inline code
  mdString = mdString.replace(/`([^`]+)`/g, function (_, content) {
    return '[CODE]' + content + '[/CODE]';
  });

  // Links
  mdString = mdString.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, function (_, text, url) {
    return text + ' (URL: ' + url + ')';
  });

  // Bold text
  mdString = mdString.replace(/\*\*([^*]+)\*\*/g, function (_, content) {
    return content.toUpperCase();
  });

  // Italic text
  mdString = mdString.replace(/\*([^*]+)\*/g, function (_, content) {
    return '_' + content + '_';
  });

  return mdString;
}

export {
  convertMarkdownToFormattedText as mark
}