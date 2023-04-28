/**
 * @jest-environment jsdom
 */
import { screen, waitFor, within } from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import { bills } from "../fixtures/bills.js"
import store from "../__mocks__/store.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      )
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)

      const windowIcon = screen.getByTestId("icon-mail")
      await waitFor(() => windowIcon)
      expect(windowIcon).toHaveClass("active-icon")
    })

    test("Should have the title Envoyer une note de frais", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      await waitFor(() => screen.getByText("Envoyer une note de frais"))
      const title = screen.getByText("Envoyer une note de frais")
      expect(title).toBeTruthy()
    })
    
    test("When I click on choisir un fichier the handleChangeFile should be called", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({ document, onNavigate, store, localStorage })
      await waitFor(() => screen.getByTestId("file"))
      const file = screen.getByTestId("file")
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      file.addEventListener("click", (e) => handleChangeFile(e))
      userEvent.click(file)
      expect(file).toBeTruthy()
      expect(handleChangeFile).toHaveBeenCalled()
    })  
    
    test("When I click on submit the handleSubmit should be called", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      const newBill = new NewBill({ document, onNavigate, store, localStorage })
      await waitFor(() => screen.getByText("Envoyer"))
      const sendBtn = screen.getByText("Envoyer")
      const handleSubmit = jest.fn(() => newBill.handleSubmit)

      sendBtn.addEventListener("click", (e) => handleSubmit(e))
      userEvent.click(sendBtn)
      const fileName = newBill.fileName

      expect(fileName).toBe(null)
      expect(sendBtn).toBeTruthy()
      expect(handleSubmit).toHaveBeenCalled()

    })

    // Post a bill
    describe("When I fill fill the form correctly and I click on submit button", () => {
      test("Then I should be go to the Bills Page", async () => {
        // for the form's data
        const selectExpenseTypeOption = expenseType => {
          const dropdown = screen.getByRole("combobox")
          userEvent.selectOptions(
            dropdown,
            within(dropdown).getByRole("option", { name: expenseType })
          )
          return dropdown
        }
        const getExpenseName = () => screen.getByTestId("expense-name")
        const getAmount = () => screen.getByTestId("amount")
        const getDate = () => screen.getByTestId("datepicker")
        const getVat = () => screen.getByTestId("vat")
        const getPct = () => screen.getByTestId("pct")
        const getCommentary = () => screen.getByTestId("commentary")
        const getFileImg = (fileName, fileType) => {
          const file = new File(["img"], fileName, {
            type: [fileType]
          })
          return file
        }

        const onNavigate = pathname => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        })

        const inputData = bills[0]
        const newBillForm = screen.getByTestId("form-new-bill")
        const handleSubmit = jest.fn(newBill.handleSubmit)
        const imageInput = screen.getByTestId("file")
        const file = getFileImg(inputData.fileName, ["image/jpg"])


        // We fill the form with the data
        selectExpenseTypeOption(inputData.type)
        userEvent.type(getExpenseName(), inputData.name)
        userEvent.type(getAmount(), inputData.amount.toString())
        userEvent.type(getDate(), inputData.date)
        userEvent.type(getVat(), inputData.vat.toString())
        userEvent.type(getPct(), inputData.pct.toString())
        userEvent.type(getCommentary(), inputData.commentary)
        await userEvent.upload(imageInput, file)

        // We check the form's data
        expect(selectExpenseTypeOption(inputData.type).validity.valueMissing).toBeFalsy()
        expect(getDate().validity.valueMissing).toBeTruthy()
        expect(getAmount().validity.valueMissing).toBeFalsy()
        expect(getPct().validity.valueMissing).toBeFalsy()

        newBill.fileName = file.name

        const sendBtn = screen.getByText("Envoyer")
        expect(sendBtn.type).toBe("submit")

        newBillForm.addEventListener("submit", handleSubmit)
        userEvent.click(sendBtn)

        expect(handleSubmit).toHaveBeenCalledTimes(1)
        expect(screen.getByText("Mes notes de frais")).toBeVisible()
      })
    })
  })
})
