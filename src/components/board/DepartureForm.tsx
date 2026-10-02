import { useState, type FormEvent } from 'react'
import { Modal, Button, Input, Label, Textarea, useToast } from '@/components/ui'
import { callAction } from '@/lib/actions'
import { boardLocalInputToUTCISOString, defaultLocalInputValue } from '@/lib/time'

interface DepartureFormProps {
  open: boolean
  onClose: () => void
}

/** Modal form for logging a departure — a vessel, its people, and when it's due back. */
export function DepartureForm({ open, onClose }: DepartureFormProps) {
  const { success, error } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [vesselName, setVesselName] = useState('')
  const [vesselDescription, setVesselDescription] = useState('')
  const [skipper, setSkipper] = useState('')
  const [personsAboard, setPersonsAboard] = useState('1')
  const [plannedArea, setPlannedArea] = useState('')
  const [expectedReturnAt, setExpectedReturnAt] = useState(() => defaultLocalInputValue(120))

  function resetAndClose() {
    setVesselName('')
    setVesselDescription('')
    setSkipper('')
    setPersonsAboard('1')
    setPlannedArea('')
    setExpectedReturnAt(defaultLocalInputValue(120))
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await callAction('logDeparture', {
        vesselName,
        vesselDescription,
        skipper,
        personsAboard: Number(personsAboard) || 1,
        plannedArea,
        // Entered in the board's timezone; stored as UTC (see src/lib/time.ts).
        expectedReturnAt: boardLocalInputToUTCISOString(expectedReturnAt),
      })
      if (!result.success) {
        error('Could not log departure', result.error)
        return
      }
      success('Departure logged', `${vesselName} is on the board.`)
      resetAndClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={resetAndClose} size="lg">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <Modal.Header>
          <Modal.Title>Log a departure</Modal.Title>
          <Modal.Description>Every field helps whoever has to call for help later.</Modal.Description>
        </Modal.Header>

        <Modal.Body>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vesselName">Vessel name</Label>
              <Input
                id="vesselName"
                required
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
                placeholder="Wind Dancer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vesselDescription">Vessel description</Label>
              <Input
                id="vesselDescription"
                value={vesselDescription}
                onChange={(e) => setVesselDescription(e.target.value)}
                placeholder="24ft sloop, white hull, blue sail cover"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="skipper">Skipper</Label>
              <Input
                id="skipper"
                required
                value={skipper}
                onChange={(e) => setSkipper(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="personsAboard">Persons aboard</Label>
              <Input
                id="personsAboard"
                type="number"
                min={1}
                required
                value={personsAboard}
                onChange={(e) => setPersonsAboard(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plannedArea">Planned area or route</Label>
              <Textarea
                id="plannedArea"
                value={plannedArea}
                onChange={(e) => setPlannedArea(e.target.value)}
                placeholder="North cove, back by the dam side"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expectedReturnAt">Expected return (Pacific time)</Label>
              <Input
                id="expectedReturnAt"
                type="datetime-local"
                required
                value={expectedReturnAt}
                onChange={(e) => setExpectedReturnAt(e.target.value)}
              />
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="ghost" onClick={resetAndClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Log departure
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
