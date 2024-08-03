import { GeneratePodcastProps } from '@/types'
import React, { useState } from 'react'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { Loader } from 'lucide-react'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { v4 as uuidv4 } from 'uuid'

const useGeneratePodcast = (props:GeneratePodcastProps) => {
    const {
        voicePrompt,
        audio,
        setAudio,
        voiceType
    } = props
    const [isGenerating, setIsGenerating] = useState(false)

    const getPodcastAudio = useAction(api.openai.generateAudioAction)

    const generatePodcast = async () => {
        setIsGenerating(true)
        setAudio('')

        if(!voicePrompt){
            //todo: show error message (toast)
            return setIsGenerating(false)
        }

        try{
            const response = await getPodcastAudio({
                voice:voiceType as string,
                input:voicePrompt
            })
            const blob = new Blob([response], { type: 'audio/mpeg' })
            const fileName = `podcast-${uuidv4()}.mp3`
            const file = new File([blob], fileName, { type: 'audio/mpeg' })
        }catch(error){
            console.log("Erro ao gerar o podcast", error)
            //todo: show error message (toast)
            setIsGenerating(false)
        }
    }
    return { isGenerating, generatePodcast: generatePodcast }
}

const GeneratePodcast = (props:GeneratePodcastProps) => {
    const {
        voicePrompt,
        setVoicePrompt,
        audio,
        setAudio,
        setAudioStorageId,
        setAudioDuration
    } = props
  const {isGenerating, generatePodcast} = useGeneratePodcast(props)

  return (
    <div>
        <div className="flex flex-col gap-2.5">
            <Label className="text-16 font-bold text-white-1">
                Prompt de IA para gerar Podcast
            </Label>
            <Textarea
                className="input-class font-light focus-visible:ring-offset-orange-1 resize-none"
                placeholder="Crie um texto para gerar o audio"
                rows={5}
                value={voicePrompt}
                onChange={(e) => setVoicePrompt(e.target.value)}
            />
        </div>
        <div className="mt-5 w-full max-w-[200px]">
            <Button type="submit" className="text-16 bg-orange-1 py-4 font-bold text-white-1">
                {isGenerating ? (
                    <>
                    Gerando
                    <Loader size={20} className="animate-spin ml-2" />
                    </>
                ) : (
                    "Gerar"
                )}
            </Button>
        </div>
        {audio && (
            <audio
                controls
                src={audio}
                autoPlay
                className="mt-5"
                onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
            />
        )}
    </div>
  )
}

export default GeneratePodcast