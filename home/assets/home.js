const currentTheme = () =>
  document.documentElement.getAttribute('data-theme') ||
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

const saveTheme = (theme) => {
  try { localStorage.setItem('theme', theme) } catch (e) { /* storage unavailable */ }
}

const initThemeToggle = () => {
  const button = document.getElementById('theme-toggle')
  if (!button) return
  button.hidden = false
  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    saveTheme(next)
  })
}

const initTabs = (group) => {
  const figures = [...group.querySelectorAll('.snippet')]
  if (figures.length < 2) return
  const buttons = figures.map((f) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = f.querySelector('figcaption').textContent
    return b
  })
  const show = (i) => {
    figures.forEach((f, j) => { f.hidden = i !== j })
    buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)))
  }
  const bar = document.createElement('div')
  bar.className = 'tabbar'
  buttons.forEach((b, i) => { b.addEventListener('click', () => show(i)); bar.append(b) })
  group.insertBefore(bar, figures[0])
  show(0)
}

initThemeToggle()
document.querySelectorAll('[data-tabs]').forEach(initTabs)
