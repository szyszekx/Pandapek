import { Button } from "@/components/ui/button"
import {SteamIcon} from "@/components/icons/fa6-brands-steam"



export default function CardSpacing() {


  return (
    <div className="flex items-center justify-center h-screen  text-white">
        <Button className="text-xl px-5 py-3 font-bold flex items-center space-x-4 bg-steam">
            <SteamIcon width={32} height={32}/>            
            <span>Login with Steam</span>
        </Button>
    </div>
  )
}
