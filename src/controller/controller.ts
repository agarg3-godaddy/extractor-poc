import { Request, Response } from 'express';
import { MemoryService } from '../service/memoryService';

export class MemoryController {
  // GET endpoint
  public getData = (req: Request, res: Response): void => {
    res.status(200).json({
      message: 'Hello from GET endpoint!',
      timestamp: new Date().toISOString(),
      method: 'GET'
    });
  };

  // POST endpoint
  public createSessiom = async (req: Request, res: Response) => {
    const { body } = req;
    const ucid = await MemoryService.createSession(body.shopperId,req);
    res.status(201).json({
      message: 'Data received successfully!',
      receivedData: body,
      ucid: ucid,
      timestamp: new Date().toISOString(),
      method: 'POST'
    });
  };
  public sendMessage = async (req: Request, res: Response) => {
    const { body } = req;
    //const message = await MemoryService.sendMessage(body.ucid, body.message, body.shopperId);
    res.status(200).json({
      receivedData: body,
      message: "test"
    });
  };

}
