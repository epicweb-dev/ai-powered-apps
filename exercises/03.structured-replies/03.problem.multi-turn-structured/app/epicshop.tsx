import { EpicShopIFrameSync } from '@epic-web/workshop-utils/iframe-sync'
import * as React from 'react'
import { useNavigate } from 'react-router'

export function EpicShop() {
	const navigate = useNavigate()
	return <EpicShopIFrameSync React={React} navigate={navigate} />
}
