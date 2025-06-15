import { useCallback, useEffect, useState } from 'react'
import type { DnsConfig } from '../../../types/ipc'
import { OS_DEFAULT_VALUE } from '../constants'

interface UseDnsProps {
  onDnsChangeCallback: () => void
}
export interface UseDns {
  dnsList: DnsConfig[]
  selectedDns: string
  isModalOpen: boolean
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  handleDnsChange: (uiValue: string) => void
  handleSaveDnsList: (newList: DnsConfig[]) => void
}

export function useDns({ onDnsChangeCallback }: UseDnsProps): UseDns {
  const [dnsList, setDnsList] = useState<DnsConfig[]>([])
  const [selectedDns, setSelectedDns] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const initializeDns = async (): Promise<void> => {
      const storedDnsList = await window.api.getDnsList()
      setDnsList(storedDnsList)
      if (storedDnsList.length > 0) {
        const initialHost = storedDnsList[0].host
        const initialUiValue = initialHost === '' ? OS_DEFAULT_VALUE : initialHost
        setSelectedDns(initialUiValue)
        window.api.updateDnsConfig(initialHost)
      }
    }
    initializeDns()
  }, [])

  const handleDnsChange = useCallback(
    (uiValue: string): void => {
      const actualHost = uiValue === OS_DEFAULT_VALUE ? '' : uiValue
      setSelectedDns(uiValue)
      window.api.updateDnsConfig(actualHost)
      onDnsChangeCallback()
    },
    [onDnsChangeCallback]
  )

  const handleSaveDnsList = useCallback(
    (newList: DnsConfig[]): void => {
      setDnsList(newList)
      window.api.saveDnsList(newList)

      const isSelectedDnsStillPresent = newList.some(
        (dns) => (dns.host === '' ? OS_DEFAULT_VALUE : dns.host) === selectedDns
      )
      if (!isSelectedDnsStillPresent && newList.length > 0) {
        const newSelectedHost = newList[0].host
        const newSelectedUiValue = newSelectedHost === '' ? OS_DEFAULT_VALUE : newSelectedHost
        handleDnsChange(newSelectedUiValue)
      }
    },
    [selectedDns, handleDnsChange]
  )

  return {
    dnsList,
    selectedDns,
    isModalOpen,
    setIsModalOpen,
    handleDnsChange,
    handleSaveDnsList
  }
}
