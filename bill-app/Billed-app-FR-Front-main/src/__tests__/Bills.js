/**
 * @jest-environment jsdom
 */
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockedStore from "../__mocks__/store.js"
import router from "../app/Router.js"
import Bills from "../containers/Bills.js"


jest.mock("../app/store", () => mockedStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
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
      window.onNavigate(ROUTES_PATH.Bills)

      const windowIcon = screen.getByTestId("icon-window")
      await waitFor(() => windowIcon)
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon")
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toStrictEqual(datesSorted)
    })

    test("Should go to the Newbill's page", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const store = null
      const bill = new Bills({ document, onNavigate, store, localStorage }) 
      const btnNewBill = screen.getByTestId("btn-new-bill")
      const handleClickNewBill = jest.fn(() => bill.handleClickNewBill)
      btnNewBill.addEventListener("click", handleClickNewBill)
      fireEvent.click(btnNewBill)
      await waitFor(() => screen.getByTestId("form-new-bill"))
      const formBill = screen.getByTestId("form-new-bill")
      expect(formBill).toBeTruthy() 
      expect(handleClickNewBill).toHaveBeenCalled()     
    })

    describe("When on the bill's page", () => {
      test("Should have a the title Mes notes de frais", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const store = null
        const bill = new Bills({ document, onNavigate, store, localStorage }) 
        document.body.innerHTML = BillsUI({ data: bills })
  
        const title = await screen.getByText("Mes notes de frais")
        expect(title).toBeTruthy()
      })
    })

    describe("When i click on the icon eye", () => {
      test("Shoud open the modal", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const store = null
        const bill = new Bills({ document, onNavigate, store, localStorage }) 
        document.body.innerHTML = BillsUI({ data: bills })
        await waitFor(() => screen.getAllByTestId('icon-eye'))
        const icons = screen.getAllByTestId("icon-eye")
        const handleClickIconEye = jest.fn(bill.handleClickIconEye)
        const modale = document.getElementById("modaleFile")
        // To mock the modal
        $.fn.modal = jest.fn(() => modale.classList.add("show"))
  
        icons.forEach(icon => {
          icon.addEventListener("click", () => handleClickIconEye(icon))
          userEvent.click(icon)        

          expect(modale).toHaveClass("show")
          expect(handleClickIconEye).toHaveBeenCalled()
        })  
      })
    })

    describe("When I am on Bills page but back-end is not working, I should get an error message", () => {
      test("Then, Error page should be rendered", () => {
        document.body.innerHTML = BillsUI({ error: "error message" })
        expect(screen.getByText("Erreur")).toBeVisible()
        document.body.innerHTML = ""
      })
    })

    // Test intégration GET    
    describe("When I navigate to Bills Page", () => {
      test("fetches bills from mock API GET", async () => {
        jest.spyOn(mockedStore, "bills")
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)

        await waitFor(() => screen.getByText("Mes notes de frais"))
        const newBillBtn = screen.getByText("Mes notes de frais")
        await waitFor(() => screen.getByTestId("tbody"))
        const billsTableRows = screen.getByTestId("tbody")

        expect(newBillBtn).toBeTruthy()
        expect(billsTableRows).toBeTruthy()
      })

      test("fetches bills from mock API GET", async () => {
        jest.spyOn(mockedStore, "bills")
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        })
        localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee", email: "a@a" })
        )
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        const store = null
        const bill = new Bills({ document, onNavigate, store, localStorage }) 
        window.onNavigate(ROUTES_PATH.Bills)
        expect(bill.getBills).toBeDefined()
        await waitFor(() => screen.getByText("Mes notes de frais"))
        const billType  = await screen.getByText("Type")
        expect(billType).toBeTruthy()
        const billName  = await screen.getByText("Nom")
        expect(billName).toBeTruthy()
        const billDate  = await screen.getByText("Date")
        expect(billDate).toBeTruthy()
        const billMontant  = await screen.getByText("Montant")
        expect(billMontant).toBeTruthy()
        const billStatut  = await screen.getByText("Statut")
        expect(billStatut).toBeTruthy()
        const billActions  = await screen.getByText("Actions")
        expect(billActions).toBeTruthy()
        const iconsEyes = await screen.getAllByTestId("icon-eye")
        iconsEyes.forEach(iconEye => {
          expect(iconEye).toBeTruthy()
        })
        const billsTableRows = screen.getByTestId("tbody")
        expect(billsTableRows).toBeTruthy()
      })

      describe("When an error occurs on API", () => {
        test("fetches bills from an API and fails with 404 message error", async () => {
          mockedStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 404"))
              },
            }
          })
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick)
          const message = screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })
  
        test("fetches messages from an API and fails with 500 message error", async () => {
          mockedStore.bills.mockImplementationOnce(() => {
            return {
              list: () => {
                return Promise.reject(new Error("Erreur 500"))
              },
            }
          })
  
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick)
          const message = screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })

        describe("When I went on Bills page and it is loading", () => {
          test("Then, Loading page should be rendered", () => {
            document.body.innerHTML = BillsUI({ loading: true })
            expect(screen.getByText("Loading...")).toBeVisible()
            document.body.innerHTML = ""
          })
        })
      })
    })
  })
})

