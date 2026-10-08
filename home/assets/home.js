const THEMES = ['dark', 'light']

const currentTheme = () => {
  const set = document.documentElement.getAttribute('data-theme')
  if (THEMES.includes(set)) return set
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const saveTheme = (theme) => {
  try { localStorage.setItem('theme', theme) } catch (_) {}
}

const initThemeToggle = () => {
  const button = document.getElementById('theme-toggle')
  if (!button) return
  const sync = () => button.setAttribute('aria-pressed', String(currentTheme() === 'dark'))
  button.hidden = false
  sync()
  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    saveTheme(next)
    sync()
  })
}

const tabButton = (figure) => {
  const b = document.createElement('button')
  b.type = 'button'
  b.textContent = figure.querySelector('figcaption').textContent
  return b
}

const showTab = (figures, buttons, i) => {
  figures.forEach((f, j) => { f.hidden = i !== j })
  buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)))
}

const initTabs = (group) => {
  const figures = [...group.querySelectorAll('.snippet')]
  if (figures.length < 2) return
  const buttons = figures.map(tabButton)
  const bar = document.createElement('div')
  bar.className = 'tabbar'
  buttons.forEach((b, i) => { b.addEventListener('click', () => showTab(figures, buttons, i)); bar.append(b) })
  group.insertBefore(bar, figures[0])
  showTab(figures, buttons, 0)
}

initThemeToggle()
document.querySelectorAll('[data-tabs]').forEach(initTabs)
