from typing import Annotated, Dict
from fastapi import Body, APIRouter
import requests
from config import API_URL
from utils import set_res_from_req
from models import ResponseModel
import json

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get(
    "",
    response_model=ResponseModel,
    summary="Get complete config",
)
async def get_config(methods: bool = False, new_format: bool = False):
    req = requests.get(f"{API_URL}/config?methods={methods}&new_format={new_format}")
    res = set_res_from_req(req, "GET", "Retrieve config")
    return res


@router.put(
    "",
    response_model=ResponseModel,
    summary="Update whole config",
)
async def update_config(config: Dict[str, str], method: str):
    req = requests.put(f"{API_URL}/config?method={method}", data=config)
    res = set_res_from_req(req, "PUT", "Update config")
    return res


@router.put(
    "/global",
    response_model=ResponseModel,
    summary="Update global config",
)
async def update_global_config(config: Annotated[dict, Body()], method: str):
    data = json.dumps(config, skipkeys=True, allow_nan=True, indent=6)
    req = requests.put(f"{API_URL}/config/global?method={method}", data=data)
    res = set_res_from_req(req, "PUT", "Update global config")
    return res


@router.put(
    "/service/{service_name}",
    response_model=ResponseModel,
    summary="Update service config",
)
async def update_service_config(config: Dict[str, str], method: str, service_name: str):
    req = requests.put(f"{API_URL}/config/service?method={method}", data=config)
    res = set_res_from_req(req, "PUT", f"Update service config {service_name}")
    return res


@router.delete(
    "/service/{service_name}",
    response_model=ResponseModel,
    summary="Delete service config",
)
async def delete_service_config(method: str, service_name: str):
    req = requests.delete(f"{API_URL}/config/service/{service_name}?method={method}")
    res = set_res_from_req(req, "DELETE", f"Delete service config {service_name}")
    return res
