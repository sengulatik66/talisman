import { yupResolver } from "@hookform/resolvers/yup"
import { AnalyticsPage, sendAnalyticsEvent } from "@ui/api/analytics"
import { Address } from "@ui/domains/Account/Address"
import { useAddressBook } from "@ui/hooks/useAddressBook"
import { useAnalyticsPageView } from "@ui/hooks/useAnalyticsPageView"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ModalDialog } from "talisman-ui"
import { Button, FormFieldContainer, FormFieldInputText, Modal } from "talisman-ui"
import * as yup from "yup"

import { ContactModalProps } from "./types"

type FormValues = {
  name: string
}

const schema = yup.object({
  name: yup.string().required(""),
})

const ANALYTICS_PAGE: AnalyticsPage = {
  container: "Fullscreen",
  feature: "Settings",
  featureVersion: 1,
  page: "Address book contact edit",
}

export const ContactEditModal = ({ contact, isOpen, close }: ContactModalProps) => {
  const { t } = useTranslation("admin")
  const { edit } = useAddressBook()

  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
    setError,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: { name: contact ? contact.name : "" },
  })

  const submit = useCallback(
    async (formData: FormValues) => {
      if (!contact) return
      try {
        await edit({ ...contact, ...formData })
        sendAnalyticsEvent({
          ...ANALYTICS_PAGE,
          name: "Interact",
          action: "Edit address book contact",
        })
        close()
      } catch (error) {
        setError("name", error as Error)
      }
    },
    [close, contact, edit, setError]
  )

  useAnalyticsPageView(ANALYTICS_PAGE)

  return (
    <Modal isOpen={isOpen} onDismiss={close}>
      <ModalDialog title={t("Edit contact")}>
        <form onSubmit={handleSubmit(submit)} className="grid gap-8">
          <FormFieldContainer error={errors.name?.message} label={t("Name")}>
            <FormFieldInputText
              type="text"
              {...register("name")}
              placeholder={t("Contact name")}
              autoComplete="off"
              spellCheck="false"
            />
          </FormFieldContainer>
          <div>
            <div className="text-body-secondary block text-xs">{t("Address")}</div>
            <Address
              className="mt-3 block bg-none text-xs text-white"
              address={contact?.address ?? ""}
              noShorten
            />
          </div>
          <div className="flex items-stretch gap-4 pt-4">
            <Button fullWidth onClick={close}>
              {t("Cancel")}
            </Button>
            <Button type="submit" fullWidth primary disabled={!isValid}>
              {t("Save")}
            </Button>
          </div>
        </form>
      </ModalDialog>
    </Modal>
  )
}
