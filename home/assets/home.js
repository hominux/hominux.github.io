document.querySelectorAll('[data-tabs]').forEach((group) => {
  const figures = [...group.querySelectorAll('.snippet')]
  const show = (i) => {
    figures.forEach((f, j) => { f.hidden = i !== j })
    ;[...group.querySelectorAll('.tabbar button')].forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)))
  }
  if (figures.length < 2) return
  const bar = document.createElement('div')
  bar.className = 'tabbar'
  figures.forEach((f, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = f.querySelector('figcaption').textContent
    b.addEventListener('click', () => show(i))
    bar.append(b)
  })
  group.insertBefore(bar, figures[0])
  show(0)
})
