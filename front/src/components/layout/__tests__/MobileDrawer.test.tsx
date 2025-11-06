/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { MobileDrawer } from '../MobileDrawer'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}))

// Mock createPortal for React 18
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: jest.fn((element) => element),
}))

describe('MobileDrawer', () => {
  const defaultProps = {
    open: false,
    onClose: jest.fn(),
    title: 'Menu',
    id: 'test-drawer',
    children: <div>Test content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset prefers-reduced-motion mock
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when closed', () => {
    const { container } = render(<MobileDrawer {...defaultProps} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders when open', () => {
    render(<MobileDrawer {...defaultProps} open={true} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Menu')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = jest.fn()
    render(<MobileDrawer {...defaultProps} open={true} onClose={onClose} />)

    const backdrop = screen.getByRole('dialog').previousSibling
    if (backdrop) {
      fireEvent.click(backdrop)
    }

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn()
    render(<MobileDrawer {...defaultProps} open={true} onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close menu')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('calls onClose when ESC key is pressed', async () => {
    const onClose = jest.fn()
    render(<MobileDrawer {...defaultProps} open={true} onClose={onClose} />)

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('calls onClose when pathname changes', async () => {
    const onClose = jest.fn()
    const { rerender } = render(<MobileDrawer {...defaultProps} open={true} onClose={onClose} />)

    // Mock pathname change
    ;(usePathname as jest.Mock).mockReturnValue('/catalog')
    rerender(<MobileDrawer {...defaultProps} open={true} onClose={onClose} />)

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('focuses first element when opened', async () => {
    const TestContent = () => (
      <div>
        <button>First Button</button>
        <a href="/test">Link</a>
      </div>
    )

    render(
      <MobileDrawer {...defaultProps} open={true}>
        <TestContent />
      </MobileDrawer>
    )

    await waitFor(() => {
      expect(screen.getByText('First Button')).toHaveFocus()
    })
  })

  it('sets focus to dialog element if no focusable children', async () => {
    render(<MobileDrawer {...defaultProps} open={true}>No focusable content</MobileDrawer>)

    const dialog = screen.getByRole('dialog')
    await waitFor(() => {
      expect(dialog).toHaveFocus()
    })
  })

  it('has correct ARIA attributes', () => {
    render(<MobileDrawer {...defaultProps} open={true} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'test-drawer-label')
    expect(dialog).toHaveAttribute('id', 'test-drawer')
  })

  it('renders custom title', () => {
    render(<MobileDrawer {...defaultProps} open={true} title="Custom Title" />)
    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('uses default id when not provided', () => {
    const { id, ...propsWithoutId } = defaultProps
    render(<MobileDrawer {...propsWithoutId} open={true} />)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('id', 'mobile-drawer')
  })
})

