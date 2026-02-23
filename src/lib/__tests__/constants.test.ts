import { describe, it, expect } from 'vitest'
import { TIME_SIGNATURES, NOTE_RESOLUTIONS } from '@/lib/constants'

describe('NOTE_RESOLUTIONS', () => {
  it('straight notes come before triplets', () => {
    const labels = NOTE_RESOLUTIONS.map(r => r.label)
    const firstTripletIndex = labels.findIndex(l => l.endsWith('T'))
    const lastStraightIndex = labels.reduce(
      (last, l, i) => (!l.endsWith('T') ? i : last),
      -1
    )
    expect(firstTripletIndex).toBeGreaterThan(lastStraightIndex)
  })

  it('within straight notes, perQuarter values increase (coarse to fine)', () => {
    const straightNotes = NOTE_RESOLUTIONS.filter(r => !r.label.endsWith('T'))
    for (let i = 1; i < straightNotes.length; i++) {
      expect(straightNotes[i].perQuarter).toBeGreaterThan(straightNotes[i - 1].perQuarter)
    }
  })

  it('within triplet notes, perQuarter values increase (coarse to fine)', () => {
    const tripletNotes = NOTE_RESOLUTIONS.filter(r => r.label.endsWith('T'))
    for (let i = 1; i < tripletNotes.length; i++) {
      expect(tripletNotes[i].perQuarter).toBeGreaterThan(tripletNotes[i - 1].perQuarter)
    }
  })

  it('all labels are unique', () => {
    const labels = NOTE_RESOLUTIONS.map(r => r.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('does not contain 1/2 or 1/2T (they were removed)', () => {
    const labels = NOTE_RESOLUTIONS.map(r => r.label)
    expect(labels).not.toContain('1/2')
    expect(labels).not.toContain('1/2T')
  })
})

describe('TIME_SIGNATURES', () => {
  it('all labels are unique', () => {
    const labels = TIME_SIGNATURES.map(t => t.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('beats matches the numerator of the label', () => {
    TIME_SIGNATURES.forEach(ts => {
      const numerator = parseInt(ts.label.split('/')[0])
      expect(ts.beats).toBe(numerator)
    })
  })

  it('noteValue matches the denominator of the label', () => {
    TIME_SIGNATURES.forEach(ts => {
      const denominator = parseInt(ts.label.split('/')[1])
      expect(ts.noteValue).toBe(denominator)
    })
  })
})
