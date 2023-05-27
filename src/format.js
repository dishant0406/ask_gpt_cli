/**
 * The function converts a string of markdown text into formatted text using regular expressions.
 * @param mdString - The input string in Markdown format that needs to be converted to formatted text.
 * @returns The function `convertMarkdownToFormattedText` returns a string that has been converted from
 * Markdown syntax to a formatted text syntax.
 */
function convertMarkdownToFormattedText(mdString) {

  mdString = mdString.replace(/(#{1,6})\s(.+)/g, function (_, hashes, content) {
    let level = hashes.length;
    return '\n' + ' '.repeat(level - 1) + content.toUpperCase() + '\n';
  });


  mdString = mdString.replace(/\n/g, '\n');


  mdString = mdString.replace(/```([^`]+)```/g, function (_, content) {
    return '\n[CODE]\n' + content + '\n[/CODE]\n';
  });


  mdString = mdString.replace(/`([^`]+)`/g, function (_, content) {
    return '[CODE]' + content + '[/CODE]';
  });


  mdString = mdString.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, function (_, text, url) {
    return text + ' (URL: ' + url + ')';
  });


  mdString = mdString.replace(/\*\*([^*]+)\*\*/g, function (_, content) {
    return content.toUpperCase();
  });


  mdString = mdString.replace(/\*([^*]+)\*/g, function (_, content) {
    return '_' + content + '_';
  });

  return mdString;
}

export {
  convertMarkdownToFormattedText as mark
}