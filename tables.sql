create table town(
id serial not null primary key,
town text not null,
tag text not null 
);
create table regs(
id serial not null primary key,
regnumber text not null,
town_id int not null,
foreign key (town_id) references town(id)
);
