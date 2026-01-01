import { prisma } from "../config/db.js"

//
// ============================
// MECHANIC: Create a service
// ============================
export const createService = async (req, res) => {
  try {
    const mechanicId = req.user.id
<<<<<<< HEAD
    const { name, price, serviceType } = req.body

    if (!name || price === undefined || !serviceType) {
=======
    const { name, price, shopaddress, location_lat, location_lan, serviceType } = req.body

    if (!name || price === undefined || !shopaddress || location_lat === undefined || location_lan === undefined || !serviceType) {
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
      return res.status(400).json({ message: "Missing required fields" })
    }

    const service = await prisma.service.create({
      data: {
        name,
        price,
<<<<<<< HEAD
=======
        shopaddress,
        location_lat,
        location_lan,
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
        serviceType,
        mechanicId
      }
    })

    res.status(201).json({
      message: "Service created successfully",
      service
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//
// ============================
// MECHANIC: Get all my services
// ============================
export const getMyServices = async (req, res) => {
  try {
    const mechanicId = req.user.id

    const services = await prisma.service.findMany({
      where: { mechanicId }
    })

    res.json(services)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//
// ============================
// MECHANIC: Update a service
// ============================
export const updateService = async (req, res) => {
  try {
    const mechanicId = req.user.id
    const serviceId = Number(req.params.id)
<<<<<<< HEAD
    const { name, price, serviceType } = req.body
=======
    const { name, price, shopaddress, location_lat, location_lan, serviceType } = req.body
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    if (service.mechanicId !== mechanicId) {
      return res.status(403).json({ message: "You cannot update this service" })
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
<<<<<<< HEAD
      data: { name, price, serviceType }
=======
      data: { name, price, shopaddress, location_lat, location_lan, serviceType }
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
    })

    res.json({
      message: "Service updated successfully",
      service: updatedService
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//
// ============================
// MECHANIC: Delete a service
// ============================
export const deleteService = async (req, res) => {
  try {
    const mechanicId = req.user.id
    const serviceId = Number(req.params.id)

    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    if (service.mechanicId !== mechanicId) {
      return res.status(403).json({ message: "You cannot delete this service" })
    }

    await prisma.service.delete({
      where: { id: serviceId }
    })

    res.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
