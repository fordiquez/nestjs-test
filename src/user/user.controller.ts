import {
  Controller,
  Param,
  Query,
  Body,
  Post,
  Get,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../schemas/user.schema';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse,
  ApiOperation,
  ApiTags
} from "@nestjs/swagger";
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';
import { CashDto } from './dto/cash.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'create user',
    description: 'Store the new document in users collection with such name',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'Create user with name and nullable balance',
    required: true,
    isArray: false,
  })
  @ApiCreatedResponse({
    description: 'User has been successfully created.',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'User with such name has already been created!',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response | object> {
    try {
      if (createUserDto.name) {
        const { status, message, data } = await this.userService.create(
          createUserDto,
        );
        return res.status(status).json({
          status,
          message,
          data,
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: HttpStatus.BAD_REQUEST,
          message: 'Bad request',
        });
      }
    } catch (e) {
      return {
        code: e.code,
        message: e.message,
      };
    }
  }

  @Get('balance/:id')
  @ApiOperation({
    summary: 'Get current user balance',
    description: 'Get current user balance',
  })
  @ApiOkResponse({
    description: 'Receive user balance in USD or in converted currency',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User with such id was not found!',
  })
  async balance(
    @Param('id') id: string,
    @Query('currency') currency: string,
    @Res() res: Response,
  ): Promise<Response | object> {
    try {
      const { status, message, data } = await this.userService.getBalance(
        id,
        currency,
      );
      return res.status(status).json({
        status,
        message,
        data,
      });
    } catch (e) {
      return {
        code: e.code,
        message: e.message,
      };
    }
  }

  @Post('send/:id')
  @ApiOperation({
    summary: 'Send some cash to user',
    description: 'Add cash value to user',
  })
  @ApiOkResponse({
    description: 'cash value has been successfully sent to user',
    type: User,
  })
  @ApiNotFoundResponse({
    description: 'User with such id was not found!',
  })
  async send(
    @Param('id') id: string,
    @Body() cashDto: CashDto,
    @Res() res: Response,
  ): Promise<Response | object> {
    if (cashDto.cash >= 1) {
      try {
        const { status, message, data } = await this.userService.send(
          id,
          cashDto,
        );
        return res.status(HttpStatus.OK).json({
          status,
          message,
          data,
        });
      } catch (e) {
        return {
          code: e.code,
          message: e.message,
        };
      }
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Cash value must be more than 1',
      });
    }
  }

  @Post('withdraw/:id')
  @ApiOperation({
    summary: 'Withdraw cash',
    description: 'Withdraw cash from user balance',
  })
  @ApiOkResponse({
    description: 'withdraw cash value from user balance',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'User balance is not enough or cash value lower than than 1',
  })
  @ApiNotFoundResponse({
    description: 'User with such id was not found!',
  })
  async withdraw(
    @Param('id') id: string,
    @Body() cashDto: CashDto,
    @Res() res: Response,
  ): Promise<Response | object> {
    if (cashDto.cash >= 1) {
      try {
        const { status, message, data } = await this.userService.withdraw(
          id,
          cashDto,
        );
        return res.status(status).json({
          status,
          message,
          data,
        });
      } catch (e) {
        return {
          code: e.code,
          message: e.message,
        };
      }
    } else {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        message: 'Cash value must be more than 1',
      });
    }
  }

  @Post('transfer/:from/:to')
  @ApiOperation({
    summary: 'Transfer cash between two users',
    description: 'Send cash value from one to second user',
  })
  @ApiOkResponse({
    description: 'Successfully sent cash',
  })
  @ApiBadRequestResponse({
    description: 'Not enough balance',
  })
  @ApiNotFoundResponse({
    description: 'User with such id was not found',
  })
  async transfer(
    @Param('from') from: string,
    @Param('to') to: string,
    @Body() cashDto: CashDto,
    @Res() res: Response,
  ): Promise<Response | object> {
    try {
      const { status, message, data } = await this.userService.transfer(
        from,
        to,
        cashDto,
      );
      return res.status(status).json({
        status,
        message,
        data,
      });
    } catch (e) {
      return {
        code: e.code,
        message: e.message,
      };
    }
  }
}
