import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders all variants', () => {
    const variants = [
      'primary',
      'secondary',
      'tertiary',
      'danger',
      'ghost',
    ] as const
    variants.forEach((variant) => {
      render(<Button variant={variant}>Button</Button>)
      expect(screen.getByRole('button')).toHaveClass(
        `bg-${variant === 'tertiary' ? 'gray-100' : variant === 'ghost' ? 'transparent' : variant === 'danger' ? 'error-600' : `${variant}-600`}`
      )
    })
  })

  it('renders all sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    sizes.forEach((size) => {
      render(<Button size={size}>Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        `px-${size === 'xs' ? '2' : size === 'sm' ? '3' : size === 'md' ? '4' : size === 'lg' ? '5' : '6'}`
      )
    })
  })

  it('handles loading state', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })

  it('handles disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('prevents click when disabled', () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('prevents click when loading', () => {
    const handleClick = vi.fn()
    render(
      <Button loading onClick={handleClick}>
        Click me
      </Button>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders icon on left', () => {
    render(<Button icon={<span data-testid="icon">📧</span>}>With Icon</Button>)
    const icon = screen.getByTestId('icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('mr-2')
  })

  it('renders icon on right', () => {
    render(
      <Button icon={<span data-testid="icon">📧</span>} iconPosition="right">
        With Icon
      </Button>
    )
    const icon = screen.getByTestId('icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('ml-2')
  })

  it('has proper accessibility attributes', () => {
    render(<Button>Accessible Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('focus:outline-none')
    expect(button).toHaveClass('focus:ring-2')
  })

  it('supports keyboard navigation', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button')

    fireEvent.keyDown(button, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(button, { key: ' ' })
    expect(handleClick).toHaveBeenCalledTimes(2)
  })
})
