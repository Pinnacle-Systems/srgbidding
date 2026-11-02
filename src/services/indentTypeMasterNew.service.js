import { prisma } from "../lib/prisma.js";

import { NoRecordFound } from '../configs/Responses.js';


async function get(req) {
    const data = await prisma.IndentTypeMaster.findMany();
    return {
        statusCode: 0,
        data: data,
        totalCount: data.length,
    };
}


async function getOne(name) {
    const data = await prisma.IndentTypeMaster.findUnique({
        where: { name: name }
    });
    return {
        statusCode: 0,
        data: data,
    };
}

async function getSearch(req) {
    const { searchKey } = req.params
    const { companyId, active } = req.query
    const data = await prisma.hsn.findMany({
        where: {
            companyId: companyId ? parseInt(companyId) : undefined,
            active: active ? Boolean(active) : undefined,
            OR: [
                {
                    name: {
                        contains: searchKey,
                    },
                },
                {
                    code: {
                        contains: searchKey,
                    },
                },
            ],
        }
    })
    return { statusCode: 0, data: data };
}

async function create(name, body) {
    console.log(body, "req.body")

    const data = await prisma.IndentTypeMaster.upsert({
        where: { name: name },
        update: { fieldSchema: body.fieldSchema },
        create: { name: name, fieldSchema: body.fieldSchema }
    });
    return {
        statusCode: 0,
        data: data,
        message: "Indent Type schema saved successfully"
    };
}

async function update(id, body) {
    const { name, code, active, tax } = await body
    const dataFound = await prisma.hsn.findUnique({
        where: {
            id: parseInt(id)
        }
    })
    if (!dataFound) return NoRecordFound("hsn");
    const data = await prisma.hsn.update({
        where: {
            id: parseInt(id),
        },
        data:
        {
            name, code, active, tax
        },
    })
    return { statusCode: 0, data };
};

async function remove(id) {
    const data = await prisma.hsn.delete({
        where: {
            id: parseInt(id)
        },
    })
    return { statusCode: 0, data };
}

export {
    get,
    getOne,
    getSearch,
    create,
    update,
    remove
}
