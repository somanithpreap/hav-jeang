import { prisma } from "../config/db.js"
<<<<<<< HEAD
import { calculateTripAndTotalPrice } from "../service/pricingService.js"
=======

>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
//
// ============================
// CUSTOMER: Create service request
// ============================
//
<<<<<<< HEAD
import { getDistanceKmORS } from "../service/distance/orsDistance.js"

export const getNearbyMechanics = async (req, res) => {
  try {
    const { lat, lng } = req.query

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location required" })
    }

    const customerLocation = {
      lat: Number(lat),
      lng: Number(lng)
    }

    const mechanics = await prisma.user.findMany({
      where: {
        usertype: "mechanic",
        mechanic_lat: { not: null },
        mechanic_lng: { not: null }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        mechanic_lat: true,
        mechanic_lng: true,
        service: true
      }
    })

    const MAX_DISTANCE_KM = 5

    const mechanicsWithDistance = await Promise.all(
      mechanics.map(async (m) => {
        const mechanicLocation = {
          lat: m.mechanic_lat,
          lng: m.mechanic_lng
        }

        try {
          const distanceKm = await getDistanceKmORS(
            customerLocation,
            mechanicLocation
          )

          return {
            ...m,
            distanceKm
          }
        } catch (err) {
          // If ORS fails for one mechanic, we skip them
          return null
        }
      })
    )

    const nearby = mechanicsWithDistance
      .filter(m => m && m.distanceKm <= MAX_DISTANCE_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm)

    res.json(nearby)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
}


export const createServiceRequest = async (req, res) => {
  try {
    const customerId = req.user.id
    const { serviceIds, description, address, request_lng, request_lat } = req.body

    if (
      !Array.isArray(serviceIds) ||
      !serviceIds.length ||
      !address ||
      request_lat === undefined ||
      request_lng === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const services = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      include: {
        mechanic: {
          select: {
            mechanic_lat: true,
            mechanic_lng: true
          }
        }
      }
    })

    if (!services.length) {
      return res.status(400).json({ message: "Selected services not found" })
    }

    for (const s of services) {
      if (s.mechanic.mechanic_lat == null || s.mechanic.mechanic_lng == null) {
        return res.status(400).json({
          message: `Mechanic location missing for service ID ${s.id}`
        })
      }
    }

    const customerLocation = {
      lat: request_lat,
      lng: request_lng
    }

    const { tripDistanceKm, tripPrice, totalPrice } =
      await calculateTripAndTotalPrice(customerLocation, services)

    const request = await prisma.serviceRequest.create({
      data: {
        customerId,
        description,
        address,
        request_lat,
        request_lng,
        trip_price: tripPrice,
        total_price: totalPrice,
        status: "pending",
        service: {
          connect: serviceIds.map(id => ({ id }))
        }
      },
      include: { service: true }
    })

    res.status(201).json({
      ...request,
      tripDistanceKm,
      tripPrice,
      totalPrice
    })
  } catch (error) {
    console.error("Service request creation error:", error)
    res.status(500).json({ message: error.message })
=======
export const createServiceRequest = async (req, res) => {
  try {
    const customerId = req.user.id
    const {
      serviceId,
      description,
      address,
      request_lat,
      request_lan
    } = req.body

    // Validate required fields (description is optional)
    if (
      !serviceId ||
      !address ||
      request_lat === undefined ||
      request_lan === undefined
    ) {
      return res.status(400).json({
        message: "Missing required fields"
      })
    }

    // Check service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      })
    }

    // Create service request
    const request = await prisma.serviceRequest.create({
      data: {
        customerId,
        serviceId,
        description, // optional
        address,
        request_lat,
        request_lan,
        status: "pending"
      }
    })

    res.status(201).json({
      message: "Service request created successfully",
      request
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
  }
}

//
// ============================
// CUSTOMER: Get my service requests
// ============================
//
<<<<<<< HEAD

=======
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
export const getMyRequests = async (req, res) => {
  try {
    const customerId = req.user.id

    const requests = await prisma.serviceRequest.findMany({
      where: { customerId },
      include: {
        service: {
          include: {
            mechanic: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        request_date: "desc"
      }
    })

    res.json(requests)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//
// ============================
// CUSTOMER: Cancel service request
// ============================
//
export const cancelServiceRequest = async (req, res) => {
  try {
    const customerId = req.user.id
    const requestId = Number(req.params.id)

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId }
    })

    if (!request) {
      return res.status(404).json({
        message: "Service request not found"
      })
    }

    if (request.customerId !== customerId) {
      return res.status(403).json({
        message: "You are not allowed to cancel this request"
      })
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be cancelled"
      })
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: "cancelled" }
    })
<<<<<<< HEAD
    
=======
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721

    res.json({
      message: "Service request cancelled successfully",
      request: updatedRequest
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

//
// ============================
// MECHANIC: View incoming service requests
// ============================
//
export const getIncomingRequests = async (req, res) => {
  try {
    const mechanicId = req.user.id

<<<<<<< HEAD
const requests = await prisma.serviceRequest.findMany({
  where: {
    service: {
      some: {
        mechanicId
      }
    },
    status: "pending"
  },
  include: {
    customer: {
      select: { id: true, name: true, phone: true }
    },
    service: true
  },
  orderBy: { request_date: "asc" }
})

if (requests.length === 0) {
  return res.json({ message: "No incoming service requests", data: [] })
}

res.json(requests)

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "no service requests found" })
=======
    const requests = await prisma.serviceRequest.findMany({
      where: {
        service: {
          mechanicId
        },
        status: "pending"
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        service: true
      },
      orderBy: {
        request_date: "asc"
      }
    })

    res.json(requests)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
  }
}

//
// ============================
// MECHANIC: Complete service request
// ============================
//
export const completeServiceRequest = async (req, res) => {
  try {
    const mechanicId = req.user.id
    const requestId = Number(req.params.id)

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { service: true }
    })

    if (!request) {
      return res.status(404).json({
        message: "Service request not found"
      })
    }
<<<<<<< HEAD
    const isAllowed = request.service.some(
      s => s.mechanicId === mechanicId
    )

    if (!isAllowed) {
=======

    if (request.service.mechanicId !== mechanicId) {
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
      return res.status(403).json({
        message: "You are not allowed to update this request"
      })
    }

<<<<<<< HEAD
    if (request.status !== "accepted") {
      return res.status(400).json({
        message: "Only accepted requests can be completed"
      })
    }


=======
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: "completed" }
    })

    res.json({
      message: "Service request completed successfully",
      request: updatedRequest
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
<<<<<<< HEAD

//
// ============================
// MECHANIC: Accept service request
// ============================
//
export const acceptServiceRequest = async (req, res) => {
  try {
    const mechanicId = req.user.id
    const requestId = Number(req.params.id)

    const request = await prisma.serviceRequest.findUnique({
      where: { id: requestId },
      include: { service: true },
    })

    if (!request) {
      return res.status(404).json({ message: "Service request not found" })
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be accepted"
      })
    }

    // Ensure this request belongs to this mechanic
    const belongsToMechanic = request.service.some(
      s => s.mechanicId === mechanicId
    )

    if (!belongsToMechanic) {
      return res.status(403).json({
        message: "You are not allowed to accept this request"
      })
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { status: "accepted" }
    })

    res.json({
      message: "Service request accepted",
      request: updatedRequest
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}
=======
>>>>>>> 779674098868fce73f0f756da07944cecd5d4721
