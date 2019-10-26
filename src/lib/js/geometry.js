/* geometry toolkit */

class Point
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}
}

class Rectangle
{
	constructor(min, max)
	{
		this.min = min;
		this.max = max;
	}
}

function
Pt(x, y)
{
	return new Point(x, y);
}

function
Rpt(min, max)
{
	return new Rectangle(min, max);
}

function
Rect(minx, miny, maxx, maxy)
{
	return new Rectangle(Pt(minx, miny), Pt(maxx, maxy));
}

function
Dx(r)
{
	return r.max.x - r.min.x;
}

function
Dy(r)
{
	return r.max.y - r.min.y;
}

function
addpt(a, b)
{
	return Pt(a.x+b.x, a.y+b.y);
}

function
subpt(a, b)
{
	return Pt(a.x-b.x, a.y-b.y);
}

function
mulpt(p, s)
{
	return Pt(p.x*s, p.y*s);
}

function
divpt(p, s)
{
	return Pt(p.x/s, p.y/s);
}

function
ptinrect(p, r)
{
	return p.x >= r.min.x && p.x < r.max.x &&
		p.y >= r.min.y && p.y < r.max.y;
}
