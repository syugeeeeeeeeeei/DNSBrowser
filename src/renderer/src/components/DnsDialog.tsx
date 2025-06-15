import { Plus, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import type { DnsConfig } from '../../../types/ipc'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface DnsDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  currentList: DnsConfig[]
  onSave: (newList: DnsConfig[]) => void
}

export function DnsDialog({
  isOpen,
  onOpenChange,
  currentList,
  onSave
}: DnsDialogProps): React.JSX.Element {
  const [editorList, setEditorList] = useState<DnsConfig[]>([])

  useEffect(() => {
    if (isOpen) {
      setEditorList(JSON.parse(JSON.stringify(currentList)))
    }
  }, [isOpen, currentList])

  const handleFieldChange = (index: number, field: 'name' | 'host', value: string): void => {
    const newList = [...editorList]
    newList[index] = { ...newList[index], [field]: value }
    setEditorList(newList)
  }

  const handleAddRow = (): void => {
    setEditorList([...editorList, { name: '', host: '' }])
  }

  const handleRemoveRow = (index: number): void => {
    const newList = editorList.filter((_, i) => i !== index)
    setEditorList(newList)
  }

  const handleSaveClick = (): void => {
    const newList = editorList.filter((dns) => dns.name.trim() !== '' || dns.host.trim() !== '')
    onSave(newList)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit DNS List</DialogTitle>
          <DialogDescription>
            Add, edit, or remove your custom DNS servers. Empty rows will be ignored.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-6 items-center gap-4">
            <Label htmlFor="name" className="col-span-3 text-left">
              Name
            </Label>
            <Label htmlFor="host" className="col-span-3 text-left">
              Host (IP Address)
            </Label>
          </div>
          {editorList.map((dns, index) => (
            <div key={index} className="grid grid-cols-6 items-center gap-4">
              <Input
                value={dns.name}
                onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                className="col-span-3"
              />
              <Input
                value={dns.host}
                onChange={(e) => handleFieldChange(index, 'host', e.target.value)}
                className="col-span-2"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveRow(index)}
                className="col-span-1 justify-self-center"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddRow} className="mt-2">
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveClick}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
