import DOMPurify from 'dompurify'
import { marked } from 'marked'
export default (text: string) => {
  return DOMPurify.sanitize(marked.parse(text, { async: false }))
}
