import React, { useRef, useState } from 'react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Loader } from 'lucide-react'
import { GenerateThumbnailProps } from '@/types'
import { Input } from './ui/input'
import Image from 'next/image'
import { useToast } from './ui/use-toast'
import { useAction, useMutation } from 'convex/react'
import { useUploadFiles } from '@xixixao/uploadstuff/react'
import { api } from '@/convex/_generated/api'
import { v4 as uuidv4 } from 'uuid'

const GenerateThumbnail = ({
  setImage, 
  setImageStorageId,
  image,
  imagePrompt,
  setImagePrompt
}:GenerateThumbnailProps) => {
  const [isAiThumbnail, setIsAiThumbnail] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const {toast} = useToast()

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const { startUpload } = useUploadFiles(generateUploadUrl)
  const getImageUrl = useMutation(api.podcasts.getUrl)

  const handleGenerateThumbnail = useAction(api.openai.generateThumbnailAction)

  const imageRef = useRef<HTMLInputElement>(null)

  const handleImage = async(blob:Blob, fileName: string) => {
    setIsImageLoading(true)
    setImage("")

    try{
      
      const file = new File([blob], fileName, { type: 'image/png' })

      const uploaded = await startUpload([file])
      const storageId = (uploaded[0].response as any).storageId

      setImageStorageId(storageId)

      const imageUrl = await getImageUrl({ storageId })
      setImage(imageUrl!)
      setIsImageLoading(false)
      toast({
        title:"Thumbnail gerada com sucesso",
      })
    }catch(error){
      console.log(error)
      toast({
        title: "Erro ao gerar a imagem",
        variant: "destructive"
      })
    }
  }
  const generateImage = async() => {
   try{
    const response = await handleGenerateThumbnail({prompt:imagePrompt})
    const blob = new Blob([response], { type: "image/png" })
    handleImage(blob, `thumbnail-${uuidv4()}.png`)
   }catch(error){
    console.log(error)
    toast({
      title: "Erro ao gerar a imagem",
      variant: "destructive"
    })
   }
  }
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    try{
      const files = e.target.files
      if(!files) return
      const file = files[0]
      const blob = await file.arrayBuffer()
        .then(ab => new Blob([ab]))
      
      handleImage(blob, file.name)
    }catch(error){
      console.log(error)
      toast({
        title: "Erro ao tentar carregar a imagem",
        variant: "destructive"
      })
    }
  }

  return (
    <>
      <div className="generate_thumbnail">
        <Button
          type="button"
          variant="plain"
          onClick={() => setIsAiThumbnail(true)}
          className={cn("", {"bg-black-6" : isAiThumbnail})}
        >
          Use a IA para gerar uma thumbnail
        </Button>
        <Button
          type="button"
          variant="plain"
          onClick={() => setIsAiThumbnail(false)}
          className={cn("", {"bg-black-6" : !isAiThumbnail})}
        >
          Faça Upload de uma imagem customizada.
        </Button>
      </div>
      {isAiThumbnail ? (
        <div className="flex flex-col gap-2.5">
          <div className="mt-5 flex flex-col gap-2.5">
            <Label className="text-16 font-bold text-white-1">
                Prompt de IA para gerar Podcast
            </Label>
            <Textarea
                className="input-class font-light focus-visible:ring-offset-orange-1 resize-none"
                placeholder="Insira um texto para gerar a thumbnail"
                rows={5}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
            />
          </div>
          <div className="w-full max-w-[200px]">
              <Button
                  type="submit"
                  className="text-16 bg-orange-1 py-4 font-bold text-white-1"
                  onClick={generateImage}
              >
                  {isImageLoading ? (
                      <>
                      Gerando
                      <Loader size={20} className="animate-spin ml-2" />
                      </>
                  ) : (
                      "Gerar"
                  )}
              </Button>
          </div>
        </div>
      ) : (
        <div className="image_div" onClick={() => imageRef?.current?.click()}>
          <Input
            type="file"
            className="hidden"
            ref={imageRef}
            onChange={(e) => uploadImage(e)}
          />
          {!isImageLoading ? (
            <Image
              src="/icons/upload-image.svg"
              width={40}
              height={40}
              alt="upload"
            />
          ): (
            <div className="text-16 flex-center font-medium text-white-1">
              Carregando
              <Loader size={20} className="animate-spin ml-2" />
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-12 font-bold text-orange-1">
              Clique para carregar a imagem
            </h2>
            <p className="text-12 font-normal text-gray-1">SVG, PNG, JPG or GIF (MAX. 1080 X 1080)</p>
          </div>
        </div>
      )}
      {image && (
        <div className="flex-center w-full">
          <Image
            src={image}
            width={200}
            height={200}
            className="mt-5"
            alt='thumbnail'
          />
        </div>
      )}
    </>
  )
}

export default GenerateThumbnail