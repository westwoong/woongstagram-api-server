const BadRequestException = require('./BadRequestException');
const NotFoundException = require('./NotFoundException');
const ForbiddenException = require('./ForbiddenException');
const UnauthorizedException = require('./UnauthorizedException');

module.exports = {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException
};