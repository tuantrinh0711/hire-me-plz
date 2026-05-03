import { renderToString } from 'react-dom/server'
import Applications from './Applications'

describe('Applications', () => {
  test('renders the applications list', () => {
    const html = renderToString(<Applications />)

    expect(html).toContain('Applications')
    expect(html).toContain('Frontend Engineer')
    expect(html).toContain('Product Designer')
    expect(html).toContain('Data Analyst')
  })
})
