const BadRequestException = require('./BadRequestException');
const NotFoundException = require('./NotFoundException');
const ForbiddenException = require('./ForbiddenException');
const UnauthorizedException = require('./UnauthorizedException');
const ConflictException = require('./ConflictException');

module.exports = {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException
};