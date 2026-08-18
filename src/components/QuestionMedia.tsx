type QuestionMediaProps = {
  src?: string
  alt: string
}

export function QuestionMedia({ src, alt }: QuestionMediaProps) {
  if (!src) {
    return null
  }

  const resolvedSrc = src.startsWith('http') || src.startsWith('data:') || src.startsWith('/')
    ? src
    : `${import.meta.env.BASE_URL}${src}`

  return (
    <figure className="question-media">
      <img src={resolvedSrc} alt={alt} />
    </figure>
  )
}
